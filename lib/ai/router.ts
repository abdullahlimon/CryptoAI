import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { AIProvider, AICompleteOpts, AICompleteResult } from "./types";
import { groqAvailable, groqComplete } from "./providers/groq";
import { geminiAvailable, geminiComplete } from "./providers/gemini";
import { ollamaAvailable, ollamaComplete } from "./providers/ollama";

/**
 * Provider preference order:
 *   1. opts.prefer (if available)
 *   2. AI_DEFAULT_PROVIDER env (groq | gemini | ollama)
 *   3. Auto: groq → gemini → ollama
 */
async function resolveOrder(prefer?: AIProvider): Promise<AIProvider[]> {
  const def = (process.env.AI_DEFAULT_PROVIDER as AIProvider | "auto" | undefined) ?? "auto";
  const ordered: AIProvider[] = [];

  const push = (p: AIProvider) => {
    if (!ordered.includes(p)) ordered.push(p);
  };
  if (prefer) push(prefer);
  if (def && def !== "auto") push(def as AIProvider);
  push("groq");
  push("gemini");
  push("ollama");

  // Filter to providers that look reachable.
  const result: AIProvider[] = [];
  for (const p of ordered) {
    if (p === "groq" && groqAvailable()) result.push(p);
    else if (p === "gemini" && geminiAvailable()) result.push(p);
    else if (p === "ollama" && (await ollamaAvailable())) result.push(p);
  }
  return result;
}

async function callProvider(p: AIProvider, opts: AICompleteOpts): Promise<AICompleteResult> {
  switch (p) {
    case "groq":   return groqComplete(opts);
    case "gemini": return geminiComplete(opts);
    case "ollama": return ollamaComplete(opts);
  }
}

/**
 * Router with automatic failover.
 * Each provider gets one attempt; we move on if it errors.
 */
export async function aiComplete(opts: AICompleteOpts): Promise<AICompleteResult> {
  const order = await resolveOrder(opts.prefer);
  if (order.length === 0) {
    throw new Error(
      "No AI provider configured. Set GROQ_API_KEY, GEMINI_API_KEY, or run Ollama locally.",
    );
  }
  let lastErr: unknown = null;
  for (const p of order) {
    try {
      return await callProvider(p, opts);
    } catch (err) {
      lastErr = err;
      console.warn(`[ai-router] ${p} failed:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All AI providers failed");
}

// ----------------------------------------------------------------
// Cached completion: writes through the ai_reports table.
// Key: (target_kind, target_id, report_type, prompt_hash).
// ----------------------------------------------------------------
export type CachedCompleteOpts = AICompleteOpts & {
  target: { kind: "coin" | "sector" | "market" | "watchlist"; id: string };
  reportType: "summary" | "thesis" | "risk" | "narrative";
  ttlSeconds?: number;            // default 1h
  bypassCache?: boolean;
};

function hashPrompt(messages: AICompleteOpts["messages"]): string {
  const norm = messages.map((m) => `${m.role}:${m.content.trim()}`).join("\n---\n");
  return createHash("sha256").update(norm).digest("hex").slice(0, 32);
}

export async function aiCompleteCached(
  opts: CachedCompleteOpts,
): Promise<AICompleteResult & { cached: boolean }> {
  const { target, reportType, ttlSeconds = 3600, bypassCache, ...rest } = opts;
  const promptHash = hashPrompt(opts.messages);

  // Try cache (skip silently if Supabase isn't configured).
  if (!bypassCache) {
    try {
      const sb = supabaseAdmin();
      const { data } = await sb
        .from("ai_reports")
        .select("content, provider, model, tokens_in, tokens_out, expires_at")
        .eq("target_kind", target.kind)
        .eq("target_id", target.id)
        .eq("report_type", reportType)
        .eq("prompt_hash", promptHash)
        .maybeSingle();
      if (data && (!data.expires_at || new Date(data.expires_at) > new Date())) {
        return {
          content: data.content,
          provider: data.provider as AIProvider,
          model: data.model,
          tokensIn: data.tokens_in ?? undefined,
          tokensOut: data.tokens_out ?? undefined,
          cached: true,
        };
      }
    } catch {
      /* ignore — Supabase might not be configured yet */
    }
  }

  const result = await aiComplete(rest);

  // Write-through cache.
  try {
    const sb = supabaseAdmin();
    await sb
      .from("ai_reports")
      .upsert(
        {
          target_kind: target.kind,
          target_id: target.id,
          report_type: reportType,
          prompt_hash: promptHash,
          model: result.model,
          provider: result.provider,
          content: result.content,
          tokens_in: result.tokensIn ?? null,
          tokens_out: result.tokensOut ?? null,
          expires_at: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
        },
        { onConflict: "target_kind,target_id,report_type,prompt_hash" },
      );
  } catch {
    /* non-fatal */
  }

  return { ...result, cached: false };
}

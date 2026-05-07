import { Ollama } from "ollama";
import type { AICompleteOpts, AICompleteResult } from "../types";

let client: Ollama | null = null;
function getClient(): Ollama {
  if (!client) {
    client = new Ollama({ host: process.env.OLLAMA_HOST || "http://localhost:11434" });
  }
  return client;
}

/**
 * Best-effort availability check. Pings /api/tags. Returns false on
 * any error (e.g. Ollama not running). Cheap enough to call from the
 * router for graceful fallback.
 */
export async function ollamaAvailable(): Promise<boolean> {
  if (process.env.OLLAMA_HOST === "off") return false;
  try {
    const res = await fetch(`${process.env.OLLAMA_HOST || "http://localhost:11434"}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ollamaComplete(opts: AICompleteOpts): Promise<AICompleteResult> {
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  const res = await getClient().chat({
    model,
    messages: opts.messages,
    options: {
      temperature: opts.temperature ?? 0.4,
      num_predict: opts.maxTokens ?? 800,
    },
  });
  return {
    content: res.message?.content ?? "",
    provider: "ollama",
    model,
    tokensIn: res.prompt_eval_count,
    tokensOut: res.eval_count,
  };
}

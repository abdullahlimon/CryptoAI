import Groq from "groq-sdk";
import type { AICompleteOpts, AICompleteResult } from "../types";

let client: Groq | null = null;
function getClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  if (!client) client = new Groq({ apiKey: key });
  return client;
}

export function groqAvailable(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function groqComplete(opts: AICompleteOpts): Promise<AICompleteResult> {
  const c = getClient();
  if (!c) throw new Error("groq not configured");
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const res = await c.chat.completions.create({
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 800,
  });

  const choice = res.choices[0];
  return {
    content: choice?.message?.content ?? "",
    provider: "groq",
    model,
    tokensIn: res.usage?.prompt_tokens,
    tokensOut: res.usage?.completion_tokens,
  };
}

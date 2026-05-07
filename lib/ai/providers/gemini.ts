import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AICompleteOpts, AICompleteResult } from "../types";

let client: GoogleGenerativeAI | null = null;
function getClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!client) client = new GoogleGenerativeAI(key);
  return client;
}

export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function geminiComplete(opts: AICompleteOpts): Promise<AICompleteResult> {
  const c = getClient();
  if (!c) throw new Error("gemini not configured");
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Combine system messages into a single systemInstruction; Gemini
  // doesn't support a "system" role inside contents.
  const sys = opts.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns = opts.messages.filter((m) => m.role !== "system");

  const model = c.getGenerativeModel({
    model: modelName,
    systemInstruction: sys || undefined,
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 800,
    },
  });

  const contents = turns.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await model.generateContent({ contents });
  const text = res.response.text();
  const usage = res.response.usageMetadata;

  return {
    content: text,
    provider: "gemini",
    model: modelName,
    tokensIn: usage?.promptTokenCount,
    tokensOut: usage?.candidatesTokenCount,
  };
}

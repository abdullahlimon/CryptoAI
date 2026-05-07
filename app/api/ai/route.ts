import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aiCompleteCached } from "@/lib/ai/router";

export const runtime = "nodejs";

const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(20),
  target: z.object({
    kind: z.enum(["coin", "sector", "market", "watchlist"]),
    id: z.string().min(1).max(64),
  }),
  reportType: z.enum(["summary", "thesis", "risk", "narrative"]).default("summary"),
  prefer: z.enum(["groq", "gemini", "ollama"]).optional(),
  temperature: z.number().min(0).max(1).default(0.4),
  maxTokens: z.number().min(50).max(2000).default(700),
  ttlSeconds: z.number().min(60).max(86_400).default(3600),
  bypassCache: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const parsedResult = await req
    .json()
    .then((body) => ({ ok: true as const, value: Body.parse(body) }))
    .catch((err: unknown) => ({ ok: false as const, err }));
  if (!parsedResult.ok) {
    return NextResponse.json({ error: "invalid body", detail: String(parsedResult.err) }, { status: 400 });
  }
  const parsed = parsedResult.value;

  try {
    const result = await aiCompleteCached({
      messages: parsed.messages,
      target: parsed.target,
      reportType: parsed.reportType,
      prefer: parsed.prefer,
      temperature: parsed.temperature,
      maxTokens: parsed.maxTokens,
      ttlSeconds: parsed.ttlSeconds,
      bypassCache: parsed.bypassCache,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ai failed" },
      { status: 502 },
    );
  }
}

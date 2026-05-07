import type { AIMessage } from "./types";

const TERMINAL_PERSONA = `You are CryptoAI, an analyst inside a personal crypto research terminal.
Be concise, data-driven, and actionable. Never invent numbers — if you don't have a fact, say so.
Use crisp bullet structure. No filler. No disclaimers about not being a financial advisor.
Tone: senior research analyst writing internal notes for a single investor.`;

export function coinSummaryPrompt(coin: {
  symbol: string;
  name: string;
  price?: number | null;
  marketCap?: number | null;
  fdv?: number | null;
  volume24h?: number | null;
  change24h?: number | null;
  change7d?: number | null;
  change30d?: number | null;
  categories?: string[];
  description?: string | null;
}): AIMessage[] {
  const facts = [
    `Symbol: ${coin.symbol.toUpperCase()}`,
    `Name: ${coin.name}`,
    coin.price != null && `Price: $${coin.price}`,
    coin.marketCap != null && `Market cap: $${coin.marketCap.toLocaleString()}`,
    coin.fdv != null && `FDV: $${coin.fdv.toLocaleString()}`,
    coin.volume24h != null && `24h volume: $${coin.volume24h.toLocaleString()}`,
    coin.change24h != null && `24h change: ${coin.change24h.toFixed(2)}%`,
    coin.change7d != null && `7d change: ${coin.change7d.toFixed(2)}%`,
    coin.change30d != null && `30d change: ${coin.change30d.toFixed(2)}%`,
    coin.categories?.length && `Categories: ${coin.categories.slice(0, 8).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const desc = coin.description ? `\nProject description (truncated):\n${coin.description.slice(0, 1200)}` : "";

  return [
    { role: "system", content: TERMINAL_PERSONA },
    {
      role: "user",
      content: `Write a research note on ${coin.name} (${coin.symbol.toUpperCase()}).

Facts:
${facts}
${desc}

Output exactly these sections (markdown, ~120 words total):
**Snapshot** — one line.
**Bull thesis** — 2 bullets.
**Bear thesis** — 2 bullets.
**What to watch** — 2 bullets (price level, catalyst, on-chain signal).`,
    },
  ];
}

export function marketSummaryPrompt(input: {
  btcDominance?: number | null;
  fearGreed?: number | null;
  fearGreedClass?: string | null;
  totalMcap?: number | null;
  mcapChange24h?: number | null;
  topMovers?: Array<{ symbol: string; change: number }>;
  trendingSectors?: Array<{ name: string; momentum: number }>;
}): AIMessage[] {
  const lines = [
    input.totalMcap != null && `Total mcap: $${input.totalMcap.toLocaleString()} (${input.mcapChange24h?.toFixed(2)}% 24h)`,
    input.btcDominance != null && `BTC dominance: ${input.btcDominance.toFixed(1)}%`,
    input.fearGreed != null && `Fear & Greed: ${input.fearGreed} (${input.fearGreedClass})`,
    input.topMovers?.length &&
      `Top movers 24h: ${input.topMovers.map((m) => `${m.symbol} ${m.change.toFixed(1)}%`).join(", ")}`,
    input.trendingSectors?.length &&
      `Sector momentum: ${input.trendingSectors.map((s) => `${s.name}=${s.momentum}`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    { role: "system", content: TERMINAL_PERSONA },
    {
      role: "user",
      content: `Summarize today's crypto market state for a personal research dashboard.

Data:
${lines}

Output (markdown, ~80 words):
- One-line **Tape**: risk-on / risk-off / chop, with rationale.
- **Where capital is rotating**: 1-2 bullets.
- **One thing to watch next 24h**: 1 bullet.`,
    },
  ];
}

export function sectorAnalysisPrompt(input: {
  name: string;
  momentum: number | null;
  narrative: number | null;
  change24h: number | null;
  topCoins?: Array<{ symbol: string; change: number; mcap?: number | null }>;
}): AIMessage[] {
  const data = [
    `Sector: ${input.name}`,
    input.momentum != null && `Momentum: ${input.momentum}/100`,
    input.narrative != null && `Narrative strength: ${input.narrative}/100`,
    input.change24h != null && `24h change: ${input.change24h.toFixed(2)}%`,
    input.topCoins?.length &&
      `Top coins: ${input.topCoins.map((c) => `${c.symbol} ${c.change.toFixed(1)}%`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
  return [
    { role: "system", content: TERMINAL_PERSONA },
    {
      role: "user",
      content: `Brief on the ${input.name} sector.

${data}

Output (markdown, ~90 words):
**Read** — bullish / mixed / bearish, why.
**Leaders** — 2 names with one-line rationale each.
**Risk** — 1 bullet.`,
    },
  ];
}

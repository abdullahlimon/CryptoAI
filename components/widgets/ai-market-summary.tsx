import { cgGlobal, cgTopMarkets } from "@/lib/providers/coingecko";
import { getFearGreed } from "@/lib/providers/fng";
import { aiCompleteCached } from "@/lib/ai/router";
import { marketSummaryPrompt } from "@/lib/ai/prompts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

/**
 * Generates (and caches) a ~80-word AI take on today's market.
 * Cached for 30 minutes per identical input -> typically 1-2 calls/day.
 */
export async function AIMarketSummary() {
  let body: React.ReactNode;
  let provider: string | null = null;
  let cached = false;

  try {
    const [g, fng, top] = await Promise.all([
      cgGlobal().catch(() => null),
      getFearGreed().catch(() => null),
      cgTopMarkets(100, 1).catch(() => []),
    ]);

    const movers = [...top]
      .filter((c) => (c.market_cap ?? 0) > 200_000_000)
      .sort((a, b) => Math.abs(b.price_change_percentage_24h ?? 0) - Math.abs(a.price_change_percentage_24h ?? 0))
      .slice(0, 6)
      .map((c) => ({ symbol: c.symbol.toUpperCase(), change: c.price_change_percentage_24h ?? 0 }));

    const messages = marketSummaryPrompt({
      btcDominance: g?.data.market_cap_percentage.btc,
      fearGreed: fng?.value,
      fearGreedClass: fng?.classification,
      totalMcap: g?.data.total_market_cap.usd,
      mcapChange24h: g?.data.market_cap_change_percentage_24h_usd,
      topMovers: movers,
    });

    const result = await aiCompleteCached({
      messages,
      target: { kind: "market", id: "global" },
      reportType: "summary",
      ttlSeconds: 30 * 60,
      maxTokens: 350,
      temperature: 0.4,
    });
    provider = `${result.provider}/${result.model}`;
    cached = result.cached;
    body = <Markdown text={result.content} />;
  } catch (err) {
    body = (
      <p className="text-xs text-muted-foreground">
        AI summary unavailable. Configure GROQ_API_KEY, GEMINI_API_KEY, or run Ollama locally.
        <br />
        <span className="opacity-60">{err instanceof Error ? err.message : ""}</span>
      </p>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          AI Market Summary
        </CardTitle>
        <div className="flex items-center gap-1.5">
          {cached && <Badge variant="neutral">cached</Badge>}
          {provider && <Badge variant="outline">{provider}</Badge>}
        </div>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

/** Minimal markdown renderer for our limited AI output (bold + bullets). */
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const bullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const content = bullet ? trimmed.slice(2) : trimmed;
        return (
          <p key={i} className={bullet ? "pl-3 -indent-3 before:content-['•_'] before:text-primary" : ""}>
            {renderInline(content)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-foreground">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

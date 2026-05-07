import { aiCompleteCached } from "@/lib/ai/router";
import { coinSummaryPrompt } from "@/lib/ai/prompts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { CGCoinDetail } from "@/lib/providers/coingecko";

export async function CoinAIReport({ coin }: { coin: CGCoinDetail }) {
  let body: React.ReactNode;
  let provider: string | null = null;
  let cached = false;

  try {
    const messages = coinSummaryPrompt({
      symbol: coin.symbol,
      name: coin.name,
      price: coin.market_data.current_price.usd,
      marketCap: coin.market_data.market_cap.usd,
      fdv: coin.market_data.fully_diluted_valuation?.usd ?? null,
      volume24h: coin.market_data.total_volume.usd,
      change24h: coin.market_data.price_change_percentage_24h,
      change7d: coin.market_data.price_change_percentage_7d,
      change30d: coin.market_data.price_change_percentage_30d,
      categories: coin.categories,
      description: coin.description?.en?.replace(/<[^>]+>/g, "") ?? null,
    });

    const result = await aiCompleteCached({
      messages,
      target: { kind: "coin", id: coin.id },
      reportType: "thesis",
      ttlSeconds: 6 * 60 * 60, // 6h
      maxTokens: 500,
      temperature: 0.4,
    });
    provider = `${result.provider}/${result.model}`;
    cached = result.cached;
    body = <Markdown text={result.content} />;
  } catch (err) {
    body = (
      <p className="text-xs text-muted-foreground">
        AI report unavailable. {err instanceof Error ? err.message : ""}
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          AI Research Note
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

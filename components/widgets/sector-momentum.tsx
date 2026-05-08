import Link from "next/link";
import { cgTopMarkets } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { momentumScore } from "@/lib/scoring/momentum";
import { SECTORS } from "@/lib/sectors";

/**
 * Approximate sector momentum from top-N CoinGecko markets, joining
 * against the curated coin list per sector in lib/sectors.ts.
 */
export async function SectorMomentum() {
  let coins: Awaited<ReturnType<typeof cgTopMarkets>> = [];
  try {
    coins = await cgTopMarkets(250, 1);
  } catch {
    /* ignore */
  }

  const rows = SECTORS.map((s) => {
    const ids = new Set(s.coinIds);
    const matched = coins.filter((c) => ids.has(c.id));
    if (matched.length === 0)
      return { ...s, score: null, change: null, count: 0 };
    const avgChange =
      matched.reduce((a, c) => a + (c.price_change_percentage_24h ?? 0), 0) /
      matched.length;
    const totalVol = matched.reduce((a, c) => a + (c.total_volume ?? 0), 0);
    const totalMcap = matched.reduce((a, c) => a + (c.market_cap ?? 0), 0);
    const score = momentumScore({
      priceChange24h: avgChange,
      priceChange7d:
        matched.reduce(
          (a, c) => a + (c.price_change_percentage_7d_in_currency ?? 0),
          0,
        ) / matched.length,
      volume24h: totalVol,
      marketCap: totalMcap,
    });
    return { ...s, score, change: avgChange, count: matched.length };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Momentum</CardTitle>
        <Badge variant="outline">24h heuristic</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {rows.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/sectors/${r.slug}`}
                className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/40"
              >
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {r.count} coins
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <span
                    className={`num text-xs ${(r.change ?? 0) >= 0 ? "text-bull" : "text-bear"}`}
                  >
                    {r.change != null
                      ? `${r.change >= 0 ? "+" : ""}${r.change.toFixed(2)}%`
                      : "—"}
                  </span>
                  <MomentumBar score={r.score ?? 0} />
                  <span className="num w-7 text-right text-xs text-muted-foreground">
                    {r.score ?? "—"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MomentumBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

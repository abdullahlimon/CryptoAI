import Link from "next/link";
import Image from "next/image";
import { cgTopMarkets, type CGMarketCoin } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPct, formatUsd } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Mode = "gainers" | "losers" | "volume";

export async function MoversTable({ mode, limit = 10 }: { mode: Mode; limit?: number }) {
  let coins: CGMarketCoin[] = [];
  try {
    coins = await cgTopMarkets(250, 1);
  } catch {
    coins = [];
  }
  // Filter out tiny mcaps (< $50M) to reduce noise.
  const filtered = coins.filter((c) => (c.market_cap ?? 0) > 50_000_000);
  const sorted = [...filtered].sort((a, b) => {
    if (mode === "gainers") return (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0);
    if (mode === "losers")  return (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0);
    return (b.total_volume ?? 0) - (a.total_volume ?? 0);
  });
  const rows = sorted.slice(0, limit);

  const title = mode === "gainers" ? "Top Gainers (24h)" : mode === "losers" ? "Top Losers (24h)" : "Volume Leaders";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-[10px] font-mono text-muted-foreground">mcap &gt; $50M</span>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-medium">Coin</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">24h</th>
              <th className="px-3 py-2 text-right font-medium">Vol</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-muted-foreground">No data</td></tr>
            )}
            {rows.map((c) => {
              const change = c.price_change_percentage_24h ?? 0;
              return (
                <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30">
                  <td className="px-3 py-2">
                    <Link href={`/coin/${c.id}`} className="flex items-center gap-2">
                      {c.image ? (
                        <Image src={c.image} alt="" width={16} height={16} className="rounded-full" />
                      ) : null}
                      <span className="font-medium uppercase">{c.symbol}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{c.name}</span>
                    </Link>
                  </td>
                  <td className="num px-3 py-2 text-right">{formatUsd(c.current_price)}</td>
                  <td className={cn("num px-3 py-2 text-right", change >= 0 ? "text-bull" : "text-bear")}>
                    {formatPct(change)}
                  </td>
                  <td className="num px-3 py-2 text-right text-muted-foreground">
                    {formatUsd(c.total_volume, { compact: true })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

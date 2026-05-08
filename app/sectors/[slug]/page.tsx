import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getSector, SECTORS } from "@/lib/sectors";
import { cgTopMarkets } from "@/lib/providers/coingecko";
import { momentumScore } from "@/lib/scoring/momentum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/widgets/stat-card";
import { formatPct, formatUsd, cn } from "@/lib/utils";

export const revalidate = 120;

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) return { title: "Sector — CryptoAI" };
  return {
    title: `${sector.name} Sector — CryptoAI Terminal`,
    description: sector.blurb,
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) notFound();

  const top = await cgTopMarkets(250, 1).catch(() => []);
  const ids = new Set(sector.coinIds);
  const coins = top
    .filter((c) => ids.has(c.id))
    .sort(
      (a, b) =>
        (b.price_change_percentage_24h ?? 0) -
        (a.price_change_percentage_24h ?? 0),
    );

  const avg24 =
    coins.length > 0
      ? coins.reduce((a, c) => a + (c.price_change_percentage_24h ?? 0), 0) /
        coins.length
      : 0;
  const avg7d =
    coins.length > 0
      ? coins.reduce(
          (a, c) => a + (c.price_change_percentage_7d_in_currency ?? 0),
          0,
        ) / coins.length
      : 0;
  const totalMcap = coins.reduce((a, c) => a + (c.market_cap ?? 0), 0);
  const totalVol = coins.reduce((a, c) => a + (c.total_volume ?? 0), 0);
  const score = coins.length
    ? momentumScore({
        priceChange24h: avg24,
        priceChange7d: avg7d,
        volume24h: totalVol,
        marketCap: totalMcap,
      })
    : 0;

  return (
    <div className="space-y-3">
      <Link
        href="/sectors"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        All sectors
      </Link>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
        <div className="rounded bg-primary/10 p-2 text-primary">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{sector.name}</h1>
            <Badge variant="outline">{coins.length} coins</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{sector.blurb}</p>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Avg 24h"
          value={formatPct(avg24)}
          tone={avg24 >= 0 ? "bull" : "bear"}
        />
        <StatCard
          label="Avg 7d"
          value={formatPct(avg7d)}
          tone={avg7d >= 0 ? "bull" : "bear"}
        />
        <StatCard
          label="Total Mcap"
          value={formatUsd(totalMcap, { compact: true })}
        />
        <StatCard
          label="Momentum"
          value={`${score}/100`}
          tone={score >= 60 ? "bull" : score <= 40 ? "bear" : "neutral"}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{sector.name} Coins</CardTitle>
          <span className="font-mono text-[10px] text-muted-foreground">
            ranked by 24h
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {coins.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No market data for this sector yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-medium">Coin</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="px-3 py-2 text-right font-medium">24h</th>
                  <th className="px-3 py-2 text-right font-medium">7d</th>
                  <th className="px-3 py-2 text-right font-medium">Mcap</th>
                  <th className="px-3 py-2 text-right font-medium">Vol</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((c) => {
                  const ch24 = c.price_change_percentage_24h ?? 0;
                  const ch7 = c.price_change_percentage_7d_in_currency ?? 0;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 last:border-0 hover:bg-accent/30"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/coin/${c.id}`}
                          className="flex items-center gap-2"
                        >
                          {c.image && (
                            <Image
                              src={c.image}
                              alt=""
                              width={18}
                              height={18}
                              className="rounded-full"
                            />
                          )}
                          <span className="font-mono text-xs font-semibold uppercase">
                            {c.symbol}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {c.name}
                          </span>
                        </Link>
                      </td>
                      <td className="num px-3 py-2 text-right">
                        {formatUsd(c.current_price)}
                      </td>
                      <td
                        className={cn(
                          "num px-3 py-2 text-right",
                          ch24 >= 0 ? "text-bull" : "text-bear",
                        )}
                      >
                        {formatPct(ch24)}
                      </td>
                      <td
                        className={cn(
                          "num px-3 py-2 text-right",
                          ch7 >= 0 ? "text-bull" : "text-bear",
                        )}
                      >
                        {formatPct(ch7)}
                      </td>
                      <td className="num px-3 py-2 text-right text-muted-foreground">
                        {formatUsd(c.market_cap, { compact: true })}
                      </td>
                      <td className="num px-3 py-2 text-right text-muted-foreground">
                        {formatUsd(c.total_volume, { compact: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getSector, SECTORS } from "@/lib/sectors";
import { cgTopMarkets, type CGMarketCoin } from "@/lib/providers/coingecko";
import { momentumScore } from "@/lib/scoring/momentum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/widgets/stat-card";
import { CoinCell } from "@/components/ui/coin-cell";
import {
  SortableTable,
  type SortableColumn,
  type SortableRow,
} from "@/components/ui/sortable-table";
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

const COLUMNS: SortableColumn[] = [
  { key: "coin", header: "Coin", sortable: true },
  { key: "price", header: "Price", align: "right", sortable: true, className: "num" },
  { key: "change24", header: "24h", align: "right", sortable: true },
  { key: "change7d", header: "7d", align: "right", sortable: true, hideOn: "sm" },
  {
    key: "mcap",
    header: "Mcap",
    align: "right",
    sortable: true,
    hideOn: "md",
    className: "num text-muted-foreground",
  },
  {
    key: "vol",
    header: "Vol",
    align: "right",
    sortable: true,
    hideOn: "md",
    className: "num text-muted-foreground",
  },
];

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) notFound();

  const top = await cgTopMarkets(250, 1).catch(() => [] as CGMarketCoin[]);
  const ids = new Set(sector.coinIds);
  const coins = top.filter((c) => ids.has(c.id));

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

  const rows: SortableRow[] = coins.map((c) => {
    const ch24 = c.price_change_percentage_24h ?? 0;
    const ch7 = c.price_change_percentage_7d_in_currency ?? 0;
    return {
      key: c.id,
      href: `/coin/${c.id}`,
      cells: [
        <CoinCell name={c.name} symbol={c.symbol} image={c.image} />,
        formatUsd(c.current_price),
        <span className={cn("num", ch24 >= 0 ? "text-bull" : "text-bear")}>
          {formatPct(ch24)}
        </span>,
        <span className={cn("num", ch7 >= 0 ? "text-bull" : "text-bear")}>
          {formatPct(ch7)}
        </span>,
        formatUsd(c.market_cap, { compact: true }),
        formatUsd(c.total_volume, { compact: true }),
      ],
      sort: [
        c.name?.toLowerCase() ?? null,
        c.current_price ?? null,
        ch24,
        ch7,
        c.market_cap ?? null,
        c.total_volume ?? null,
      ],
    };
  });

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
            click headers to sort
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <SortableTable
            rows={rows}
            columns={COLUMNS}
            initialSort={{ key: "change24", dir: "desc" }}
            empty="No market data for this sector yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}

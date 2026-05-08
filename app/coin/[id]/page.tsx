import { Suspense } from "react";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { cgCoin, cgSearch } from "@/lib/providers/coingecko";
import { dsBestPair } from "@/lib/providers/dexscreener";
import { hasSupabase, supabaseServer } from "@/lib/supabase/server";
import { riskScore, momentumScore } from "@/lib/scoring/momentum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingViewChart, tvSymbol } from "@/components/charts/tradingview";
import { CoinAIReport } from "@/components/widgets/coin-ai-report";
import { WatchlistToggle } from "@/components/widgets/watchlist-toggle";
import { StatCard } from "@/components/widgets/stat-card";
import { formatPct, formatUsd, formatNum, cn } from "@/lib/utils";
import { prettifyCoinName, prettifyCoinSymbol } from "@/lib/format/coin";

export const revalidate = 120;

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let coin = await cgCoin(id).catch(() => null);
  if (!coin) {
    const hit = await cgSearch(id)
      .then((r) => r.coins[0])
      .catch(() => null);
    if (hit && hit.id !== id) redirect(`/coin/${hit.id}`);
    if (hit) coin = await cgCoin(hit.id).catch(() => null);
    if (!coin) notFound();
  }

  // First contract address we recognise -> pull DEX liquidity.
  const platforms = coin.platforms ?? {};
  const ethAddress = platforms["ethereum"];
  const anyAddress = ethAddress || Object.values(platforms).find((v) => !!v) || null;
  const dex = anyAddress ? await dsBestPair(anyAddress).catch(() => null) : null;

  let inWatchlist = false;
  if (hasSupabase()) {
    try {
      const sb = supabaseServer();
      const { data } = await sb.from("watchlists").select("id").eq("coin_id", coin.id).maybeSingle();
      inWatchlist = !!data;
    } catch {
      /* ignore */
    }
  }

  const md = coin.market_data;
  const change24 = md.price_change_percentage_24h;
  const liq = dex?.liquidity?.usd ?? null;
  const risk = riskScore({
    marketCap: md.market_cap.usd,
    liquidityUsd: liq,
    fdv: md.fully_diluted_valuation?.usd,
  });
  const momentum = momentumScore({
    priceChange24h: md.price_change_percentage_24h,
    priceChange7d: md.price_change_percentage_7d,
    volume24h: md.total_volume.usd,
    marketCap: md.market_cap.usd,
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
        {coin.image?.large ? (
          <Image src={coin.image.large} alt="" width={32} height={32} className="rounded-full" />
        ) : null}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {prettifyCoinName(coin.name, coin.symbol)}
            </h1>
            <Badge variant="outline">{prettifyCoinSymbol(coin.symbol)}</Badge>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {coin.categories.slice(0, 6).map((c) => (
              <Badge key={c} variant="neutral">{c}</Badge>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <div className="num text-2xl font-bold">{formatUsd(md.current_price.usd)}</div>
            <div className={cn("num text-sm", change24 >= 0 ? "text-bull" : "text-bear")}>
              {formatPct(change24)} 24h
            </div>
          </div>
          <WatchlistToggle coinId={coin.id} initial={inWatchlist} />
        </div>
      </div>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Market Cap" value={formatUsd(md.market_cap.usd, { compact: true })} />
        <StatCard label="FDV" value={formatUsd(md.fully_diluted_valuation?.usd ?? null, { compact: true })} />
        <StatCard label="24h Vol" value={formatUsd(md.total_volume.usd, { compact: true })} />
        <StatCard label="Liquidity" value={formatUsd(liq, { compact: true })} sub={dex ? `${dex.dexId}/${dex.chainId}` : undefined} />
        <StatCard
          label="Momentum"
          value={`${momentum}/100`}
          tone={momentum >= 60 ? "bull" : momentum <= 40 ? "bear" : "neutral"}
        />
        <StatCard
          label="Risk"
          value={`${risk}/100`}
          tone={risk >= 70 ? "bear" : risk <= 40 ? "bull" : "neutral"}
        />
      </section>

      {/* Chart + AI report */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <Badge variant="outline">TradingView</Badge>
            </CardHeader>
            <CardContent className="p-2">
              <TradingViewChart symbol={tvSymbol(coin.symbol)} height={460} />
            </CardContent>
          </Card>
        </div>
        <Suspense fallback={<Skeleton className="h-[460px] w-full" />}>
          <CoinAIReport coin={coin} />
        </Suspense>
      </section>

      {/* Performance + supply */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
          <CardContent>
            <Row label="24h" value={formatPct(md.price_change_percentage_24h)} tone={md.price_change_percentage_24h >= 0 ? "bull" : "bear"} />
            <Row label="7d"  value={formatPct(md.price_change_percentage_7d)}  tone={md.price_change_percentage_7d  >= 0 ? "bull" : "bear"} />
            <Row label="30d" value={formatPct(md.price_change_percentage_30d)} tone={md.price_change_percentage_30d >= 0 ? "bull" : "bear"} />
            <Row label="From ATH" value={formatPct(md.ath_change_percentage.usd)} tone="bear" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Supply</CardTitle></CardHeader>
          <CardContent>
            <Row label="Circulating" value={formatNum(md.circulating_supply, { compact: true })} />
            <Row label="Total" value={formatNum(md.total_supply, { compact: true })} />
            <Row label="Max" value={md.max_supply ? formatNum(md.max_supply, { compact: true }) : "∞"} />
            <Row
              label="FDV / MC"
              value={
                md.fully_diluted_valuation?.usd && md.market_cap.usd
                  ? (md.fully_diluted_valuation.usd / md.market_cap.usd).toFixed(2) + "x"
                  : "—"
              }
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "bull" | "bear" }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-1.5 last:border-0">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className={cn("num text-sm", tone === "bull" && "text-bull", tone === "bear" && "text-bear")}>
        {value}
      </span>
    </div>
  );
}

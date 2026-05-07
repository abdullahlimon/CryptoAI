import { Suspense } from "react";
import { GlobalStats } from "@/components/widgets/global-stats";
import { FearGreedWidget } from "@/components/widgets/fear-greed";
import { MoversTable } from "@/components/widgets/movers-table";
import { TrendingWidget } from "@/components/widgets/trending";
import { SectorMomentum } from "@/components/widgets/sector-momentum";
import { AIMarketSummary } from "@/components/widgets/ai-market-summary";
import { WatchlistStrip } from "@/components/widgets/watchlist-strip";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

export default function DashboardPage() {
  return (
    <div className="space-y-3">
      {/* Top stat row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Suspense fallback={<StatsSkeleton n={4} />}>
          <GlobalStats />
        </Suspense>
      </section>

      {/* AI summary + Fear & Greed + Watchlist */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton h={180} className="lg:col-span-2" />}>
          <AIMarketSummary />
        </Suspense>
        <Suspense fallback={<CardSkeleton h={180} />}>
          <FearGreedWidget />
        </Suspense>
        <Suspense fallback={<CardSkeleton h={180} />}>
          <WatchlistStrip />
        </Suspense>
      </section>

      {/* Movers + sector momentum */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Suspense fallback={<CardSkeleton h={400} />}>
          <MoversTable mode="gainers" limit={10} />
        </Suspense>
        <Suspense fallback={<CardSkeleton h={400} />}>
          <MoversTable mode="losers" limit={10} />
        </Suspense>
        <Suspense fallback={<CardSkeleton h={400} />}>
          <SectorMomentum />
        </Suspense>
      </section>

      {/* Trending + volume leaders */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Suspense fallback={<CardSkeleton h={360} />}>
          <TrendingWidget />
        </Suspense>
        <Suspense fallback={<CardSkeleton h={360} />}>
          <MoversTable mode="volume" limit={10} />
        </Suspense>
      </section>
    </div>
  );
}

function StatsSkeleton({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] w-full" />
      ))}
    </>
  );
}

function CardSkeleton({ h, className }: { h: number; className?: string }) {
  return <Skeleton style={{ height: h }} className={className} />;
}

import { cgGlobal } from "@/lib/providers/coingecko";
import { StatCard } from "./stat-card";
import { formatPct, formatUsd } from "@/lib/utils";

export async function GlobalStats() {
  const data = await cgGlobal().catch(() => null);
  if (!data) {
    return (
      <>
        <StatCard label="Total Mcap" value="—" />
        <StatCard label="24h Volume" value="—" />
        <StatCard label="BTC Dominance" value="—" />
        <StatCard label="ETH Dominance" value="—" />
      </>
    );
  }
  const g = data.data;
  const change = g.market_cap_change_percentage_24h_usd;
  return (
    <>
      <StatCard
        label="Total Mcap"
        value={formatUsd(g.total_market_cap.usd, { compact: true })}
        sub={formatPct(change)}
        tone={change >= 0 ? "bull" : "bear"}
      />
      <StatCard
        label="24h Volume"
        value={formatUsd(g.total_volume.usd, { compact: true })}
        sub={`${g.markets} markets`}
      />
      <StatCard
        label="BTC Dominance"
        value={`${g.market_cap_percentage.btc.toFixed(1)}%`}
      />
      <StatCard
        label="ETH Dominance"
        value={`${g.market_cap_percentage.eth.toFixed(1)}%`}
      />
    </>
  );
}

import { cgTopMarkets, type CGMarketCoin } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SortableTable,
  type Column,
} from "@/components/ui/sortable-table";
import { CoinCell } from "@/components/ui/coin-cell";
import { formatPct, formatUsd, cn } from "@/lib/utils";

type Mode = "gainers" | "losers" | "volume";

export async function MoversTable({
  mode,
  limit = 10,
}: {
  mode: Mode;
  limit?: number;
}) {
  let coins: CGMarketCoin[] = [];
  try {
    coins = await cgTopMarkets(250, 1);
  } catch {
    coins = [];
  }
  // Filter out tiny mcaps (< $50M) to reduce noise.
  const filtered = coins.filter((c) => (c.market_cap ?? 0) > 50_000_000);
  const sorted = [...filtered].sort((a, b) => {
    if (mode === "gainers")
      return (
        (b.price_change_percentage_24h ?? 0) -
        (a.price_change_percentage_24h ?? 0)
      );
    if (mode === "losers")
      return (
        (a.price_change_percentage_24h ?? 0) -
        (b.price_change_percentage_24h ?? 0)
      );
    return (b.total_volume ?? 0) - (a.total_volume ?? 0);
  });
  const rows = sorted.slice(0, limit);

  const title =
    mode === "gainers"
      ? "Top Gainers (24h)"
      : mode === "losers"
        ? "Top Losers (24h)"
        : "Volume Leaders";

  const columns: Column<CGMarketCoin>[] = [
    {
      key: "coin",
      header: "Coin",
      cell: (c) => (
        <CoinCell name={c.name} symbol={c.symbol} image={c.image} />
      ),
      sortValue: (c) => c.name?.toLowerCase(),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      className: "num",
      cell: (c) => formatUsd(c.current_price),
      sortValue: (c) => c.current_price ?? 0,
    },
    {
      key: "change24",
      header: "24h",
      align: "right",
      cell: (c) => {
        const v = c.price_change_percentage_24h ?? 0;
        return (
          <span className={cn("num", v >= 0 ? "text-bull" : "text-bear")}>
            {formatPct(v)}
          </span>
        );
      },
      sortValue: (c) => c.price_change_percentage_24h ?? 0,
    },
    {
      key: "volume",
      header: "Vol",
      align: "right",
      className: "num text-muted-foreground",
      hideOn: "sm",
      cell: (c) => formatUsd(c.total_volume, { compact: true }),
      sortValue: (c) => c.total_volume ?? 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="font-mono text-[10px] text-muted-foreground">
          mcap &gt; $50M
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <SortableTable<CGMarketCoin>
          rows={rows}
          columns={columns}
          rowKey={(c) => c.id}
          rowHref={(c) => `/coin/${c.id}`}
          empty="No data."
        />
      </CardContent>
    </Card>
  );
}

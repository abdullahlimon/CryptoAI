import { cgTopMarkets, type CGMarketCoin } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SortableTable,
  type SortableColumn,
  type SortableRow,
} from "@/components/ui/sortable-table";
import { CoinCell } from "@/components/ui/coin-cell";
import { formatPct, formatUsd, cn } from "@/lib/utils";

type Mode = "gainers" | "losers" | "volume";

const COLUMNS: SortableColumn[] = [
  { key: "coin", header: "Coin", sortable: true },
  { key: "price", header: "Price", align: "right", sortable: true, className: "num" },
  { key: "change24", header: "24h", align: "right", sortable: true },
  {
    key: "volume",
    header: "Vol",
    align: "right",
    hideOn: "sm",
    sortable: true,
    className: "num text-muted-foreground",
  },
];

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
  const top = sorted.slice(0, limit);

  const rows: SortableRow[] = top.map((c) => {
    const ch24 = c.price_change_percentage_24h ?? 0;
    return {
      key: c.id,
      href: `/coin/${c.id}`,
      cells: [
        <CoinCell name={c.name} symbol={c.symbol} image={c.image} />,
        formatUsd(c.current_price),
        <span className={cn("num", ch24 >= 0 ? "text-bull" : "text-bear")}>
          {formatPct(ch24)}
        </span>,
        formatUsd(c.total_volume, { compact: true }),
      ],
      sort: [
        c.name?.toLowerCase() ?? null,
        c.current_price ?? null,
        ch24,
        c.total_volume ?? null,
      ],
    };
  });

  const title =
    mode === "gainers"
      ? "Top Gainers (24h)"
      : mode === "losers"
        ? "Top Losers (24h)"
        : "Volume Leaders";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="font-mono text-[10px] text-muted-foreground">
          mcap &gt; $50M
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <SortableTable rows={rows} columns={COLUMNS} empty="No data." />
      </CardContent>
    </Card>
  );
}

import { Star } from "lucide-react";
import { hasSupabase, supabaseServer } from "@/lib/supabase/server";
import { cgTopMarkets, type CGMarketCoin } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SortableTable,
  type Column,
} from "@/components/ui/sortable-table";
import { CoinCell } from "@/components/ui/coin-cell";
import { formatPct, formatUsd, cn } from "@/lib/utils";

export const revalidate = 60;

type Row = CGMarketCoin & { tags: string[] };

export default async function WatchlistPage() {
  if (!hasSupabase()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary" /> Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and the
            service role key to .env.local.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sb = supabaseServer();
  const [{ data: rows }, top] = await Promise.all([
    sb
      .from("watchlists")
      .select("coin_id, tags, notes, favorite, created_at")
      .order("created_at"),
    cgTopMarkets(250, 1).catch(() => [] as CGMarketCoin[]),
  ]);

  const ids = (rows ?? []).map((r) => r.coin_id);
  const meta = new Map(top.filter((c) => ids.includes(c.id)).map((c) => [c.id, c]));

  const tableRows: Row[] = (rows ?? [])
    .map((r) => {
      const c = meta.get(r.coin_id);
      if (!c) return null;
      return { ...c, tags: r.tags ?? [] };
    })
    .filter(Boolean) as Row[];

  const unranked = (rows ?? []).filter((r) => !meta.has(r.coin_id));

  const columns: Column<Row>[] = [
    {
      key: "coin",
      header: "Coin",
      cell: (c) => <CoinCell name={c.name} symbol={c.symbol} image={c.image} />,
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
      key: "change7d",
      header: "7d",
      align: "right",
      hideOn: "sm",
      cell: (c) => {
        const v = c.price_change_percentage_7d_in_currency ?? 0;
        return (
          <span className={cn("num", v >= 0 ? "text-bull" : "text-bear")}>
            {formatPct(v)}
          </span>
        );
      },
      sortValue: (c) => c.price_change_percentage_7d_in_currency ?? 0,
    },
    {
      key: "mcap",
      header: "Mcap",
      align: "right",
      className: "num text-muted-foreground",
      hideOn: "md",
      cell: (c) => formatUsd(c.market_cap, { compact: true }),
      sortValue: (c) => c.market_cap ?? 0,
    },
    {
      key: "tags",
      header: "Tags",
      hideOn: "md",
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.tags.join(", ") || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary" /> Watchlist
          </CardTitle>
          <span className="font-mono text-[10px] text-muted-foreground">
            {tableRows.length} coins
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {tableRows.length === 0 && unranked.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Empty. Open any coin and click <strong>Save</strong> to add it.
            </p>
          ) : (
            <SortableTable<Row>
              rows={tableRows}
              columns={columns}
              rowKey={(c) => c.id}
              rowHref={(c) => `/coin/${c.id}`}
            />
          )}
        </CardContent>
      </Card>

      {unranked.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unranked</CardTitle>
            <span className="font-mono text-[10px] text-muted-foreground">
              not in CG top 250
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/60">
              {unranked.map((r) => (
                <li
                  key={r.coin_id}
                  className="px-3 py-2 font-mono text-xs uppercase"
                >
                  {r.coin_id}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

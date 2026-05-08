import { Star } from "lucide-react";
import { hasSupabase, supabaseServer } from "@/lib/supabase/server";
import { cgTopMarkets, type CGMarketCoin } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SortableTable,
  type SortableColumn,
  type SortableRow,
} from "@/components/ui/sortable-table";
import { CoinCell } from "@/components/ui/coin-cell";
import { formatPct, formatUsd, cn } from "@/lib/utils";

export const revalidate = 60;

const COLUMNS: SortableColumn[] = [
  { key: "coin", header: "Coin", sortable: true },
  { key: "price", header: "Price", align: "right", sortable: true, className: "num" },
  { key: "change24", header: "24h", align: "right", sortable: true },
  { key: "change7d", header: "7d", align: "right", sortable: true, hideOn: "sm" },
  {
    key: "mcap",
    header: "Mcap",
    align: "right",
    hideOn: "md",
    sortable: true,
    className: "num text-muted-foreground",
  },
  { key: "tags", header: "Tags", hideOn: "md" },
];

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
  const [{ data: rowsData }, top] = await Promise.all([
    sb
      .from("watchlists")
      .select("coin_id, tags, notes, favorite, created_at")
      .order("created_at"),
    cgTopMarkets(250, 1).catch(() => [] as CGMarketCoin[]),
  ]);

  const ids = (rowsData ?? []).map((r) => r.coin_id);
  const meta = new Map(
    top.filter((c) => ids.includes(c.id)).map((c) => [c.id, c]),
  );

  const ranked = (rowsData ?? [])
    .map((r) => {
      const c = meta.get(r.coin_id);
      if (!c) return null;
      return { ...c, tags: (r.tags ?? []) as string[] };
    })
    .filter(Boolean) as Array<CGMarketCoin & { tags: string[] }>;

  const rows: SortableRow[] = ranked.map((c) => {
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
        (
          <span className="text-xs text-muted-foreground">
            {c.tags.join(", ") || "—"}
          </span>
        ),
      ],
      sort: [
        c.name?.toLowerCase() ?? null,
        c.current_price ?? null,
        ch24,
        ch7,
        c.market_cap ?? null,
        null,
      ],
    };
  });

  const unranked = (rowsData ?? []).filter((r) => !meta.has(r.coin_id));

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary" /> Watchlist
          </CardTitle>
          <span className="font-mono text-[10px] text-muted-foreground">
            {rows.length} coins
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 && unranked.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Empty. Open any coin and click <strong>Save</strong> to add it.
            </p>
          ) : (
            <SortableTable rows={rows} columns={COLUMNS} />
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

import Link from "next/link";
import { hasSupabase, supabaseServer } from "@/lib/supabase/server";
import { cgTopMarkets } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatPct, formatUsd, cn } from "@/lib/utils";

export async function WatchlistStrip() {
  if (!hasSupabase()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-primary" /> Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Connect Supabase to save coins to your watchlist.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sb = supabaseServer();
  const [{ data: rows }, top] = await Promise.all([
    sb.from("watchlists").select("coin_id").order("created_at"),
    cgTopMarkets(250, 1).catch(() => []),
  ]);

  const ids = (rows ?? []).map((r) => r.coin_id);
  const coins = top.filter((c) => ids.includes(c.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Star className="h-3 w-3 text-primary" /> Watchlist
        </CardTitle>
        <Link href="/watchlist" className="text-[10px] uppercase text-muted-foreground hover:text-foreground">
          manage →
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {coins.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Empty. Star coins to populate.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {coins.map((c) => {
              const change = c.price_change_percentage_24h ?? 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/coin/${c.id}`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent/40"
                  >
                    <span className="text-sm font-medium uppercase">{c.symbol}</span>
                    <span className="num ml-auto text-xs">{formatUsd(c.current_price)}</span>
                    <span className={cn("num w-16 text-right text-xs", change >= 0 ? "text-bull" : "text-bear")}>
                      {formatPct(change)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

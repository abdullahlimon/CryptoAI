import Link from "next/link";
import Image from "next/image";
import { hasSupabase, supabaseServer } from "@/lib/supabase/server";
import { cgTopMarkets } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPct, formatUsd, cn } from "@/lib/utils";

export const revalidate = 60;

export default async function WatchlistPage() {
  if (!hasSupabase()) {
    return (
      <Card>
        <CardHeader><CardTitle>Watchlist</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and the service role key to .env.local.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sb = supabaseServer();
  const [{ data: rows }, top] = await Promise.all([
    sb.from("watchlists").select("coin_id, tags, notes, favorite, created_at").order("created_at"),
    cgTopMarkets(250, 1).catch(() => []),
  ]);

  const ids = (rows ?? []).map((r) => r.coin_id);
  const meta = new Map(top.filter((c) => ids.includes(c.id)).map((c) => [c.id, c]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist</CardTitle>
        <span className="text-[10px] font-mono text-muted-foreground">{rows?.length ?? 0} coins</span>
      </CardHeader>
      <CardContent className="p-0">
        {(!rows || rows.length === 0) && (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Empty. Open any coin and click <strong>Save</strong> to add it.
          </p>
        )}
        {rows && rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left">Coin</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">24h</th>
                <th className="px-3 py-2 text-right">7d</th>
                <th className="px-3 py-2 text-right">Mcap</th>
                <th className="px-3 py-2 text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const c = meta.get(r.coin_id);
                if (!c) {
                  return (
                    <tr key={r.coin_id} className="border-b border-border/50">
                      <td className="px-3 py-2 uppercase">{r.coin_id}</td>
                      <td colSpan={5} className="px-3 py-2 text-xs text-muted-foreground">unranked</td>
                    </tr>
                  );
                }
                const change = c.price_change_percentage_24h ?? 0;
                const change7d = c.price_change_percentage_7d_in_currency ?? 0;
                return (
                  <tr key={r.coin_id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="px-3 py-2">
                      <Link href={`/coin/${c.id}`} className="flex items-center gap-2">
                        {c.image && <Image src={c.image} alt="" width={16} height={16} className="rounded-full" />}
                        <span className="font-medium uppercase">{c.symbol}</span>
                        <span className="text-xs text-muted-foreground">{c.name}</span>
                      </Link>
                    </td>
                    <td className="num px-3 py-2 text-right">{formatUsd(c.current_price)}</td>
                    <td className={cn("num px-3 py-2 text-right", change >= 0 ? "text-bull" : "text-bear")}>
                      {formatPct(change)}
                    </td>
                    <td className={cn("num px-3 py-2 text-right", change7d >= 0 ? "text-bull" : "text-bear")}>
                      {formatPct(change7d)}
                    </td>
                    <td className="num px-3 py-2 text-right text-muted-foreground">
                      {formatUsd(c.market_cap, { compact: true })}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {(r.tags ?? []).join(", ") || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

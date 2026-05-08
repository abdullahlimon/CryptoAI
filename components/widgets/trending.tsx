import Link from "next/link";
import { Flame } from "lucide-react";
import { cgTrending } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoinCell } from "@/components/ui/coin-cell";
import { cn } from "@/lib/utils";

export async function TrendingWidget() {
  const data = await cgTrending().catch(() => null);
  const items = data?.coins?.slice(0, 8) ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Flame className="h-3 w-3 text-primary" />
          Trending
        </CardTitle>
        <Badge variant="outline">CoinGecko</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              No data
            </li>
          )}
          {items.map(({ item }, i) => {
            const change = item.data?.price_change_percentage_24h?.usd ?? 0;
            return (
              <li key={item.id}>
                <Link
                  href={`/coin/${item.id}`}
                  className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-accent/40"
                >
                  <CoinCell
                    name={item.name}
                    symbol={item.symbol}
                    image={item.thumb}
                    rank={i + 1}
                    size="sm"
                  />
                  <span
                    className={cn(
                      "num ml-auto shrink-0 text-xs",
                      change >= 0 ? "text-bull" : "text-bear",
                    )}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

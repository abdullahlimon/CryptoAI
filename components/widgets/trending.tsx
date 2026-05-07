import Link from "next/link";
import Image from "next/image";
import { cgTrending } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function TrendingWidget() {
  const data = await cgTrending().catch(() => null);
  const items = data?.coins?.slice(0, 8) ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending</CardTitle>
        <Badge variant="outline">CoinGecko</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">No data</li>
          )}
          {items.map(({ item }, i) => {
            const change = item.data?.price_change_percentage_24h?.usd ?? 0;
            return (
              <li key={item.id}>
                <Link
                  href={`/coin/${item.id}`}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-accent/40"
                >
                  <span className="num w-5 text-xs text-muted-foreground">{i + 1}</span>
                  {item.thumb ? (
                    <Image src={item.thumb} alt="" width={16} height={16} className="rounded-full" />
                  ) : null}
                  <span className="text-sm font-medium uppercase">{item.symbol}</span>
                  <span className="truncate text-xs text-muted-foreground">{item.name}</span>
                  <span
                    className={`num ml-auto text-xs ${change >= 0 ? "text-bull" : "text-bear"}`}
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

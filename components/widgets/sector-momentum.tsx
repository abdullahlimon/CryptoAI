import Link from "next/link";
import { cgTopMarkets } from "@/lib/providers/coingecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { momentumScore } from "@/lib/scoring/momentum";

const SECTORS: { slug: string; name: string; categoryKeys: string[] }[] = [
  { slug: "ai", name: "AI", categoryKeys: ["artificial-intelligence", "ai-agents", "generative-ai"] },
  { slug: "rwa", name: "RWA", categoryKeys: ["real-world-assets-rwa", "tokenized-assets"] },
  { slug: "depin", name: "DePIN", categoryKeys: ["depin"] },
  { slug: "l2", name: "Layer 2", categoryKeys: ["layer-2", "zero-knowledge-zk"] },
  { slug: "gaming", name: "Gaming", categoryKeys: ["gaming", "play-to-earn"] },
  { slug: "memes", name: "Memes", categoryKeys: ["meme-token"] },
  { slug: "defi", name: "DeFi", categoryKeys: ["decentralized-finance-defi", "decentralized-exchange"] },
  { slug: "liquid_staking", name: "LSTs", categoryKeys: ["liquid-staking-tokens", "liquid-restaking-tokens"] },
];

/**
 * Approximate sector momentum from top-N CoinGecko markets.
 * For each sector, we're computing average 24h move + volume turnover
 * across coins whose categories overlap. Cheap and stateless.
 */
export async function SectorMomentum() {
  let coins: Awaited<ReturnType<typeof cgTopMarkets>> = [];
  try {
    coins = await cgTopMarkets(250, 1);
  } catch {
    /* ignore */
  }

  const rows = SECTORS.map((s) => {
    // We don't have categories on the markets endpoint. Approximate by name/symbol heuristics
    // or rely on coingecko categories from the detail endpoint (too many calls).
    // For dashboard MVP we use a tiny curated map of well-known coins per sector.
    // The proper fill comes from the ingestion job.
    const coinIdsBySector: Record<string, Set<string>> = {
      ai: new Set(["render-token", "fetch-ai", "bittensor", "the-graph", "near", "internet-computer", "akash-network", "ocean-protocol"]),
      rwa: new Set(["chainlink", "ondo-finance", "pendle", "maker", "centrifuge"]),
      depin: new Set(["render-token", "helium", "filecoin", "akash-network", "iotex", "theta-token"]),
      l2: new Set(["arbitrum", "optimism", "matic-network", "starknet", "mantle", "base"]),
      gaming: new Set(["immutable-x", "ronin", "axie-infinity", "gala", "the-sandbox", "decentraland"]),
      memes: new Set(["dogecoin", "shiba-inu", "pepe", "dogwifcoin", "bonk", "floki"]),
      defi: new Set(["uniswap", "aave", "maker", "curve-dao-token", "compound-governance-token", "lido-dao"]),
      liquid_staking: new Set(["lido-dao", "rocket-pool", "ether-fi", "frax-share", "jito-governance-token"]),
    };
    const ids = coinIdsBySector[s.slug] ?? new Set<string>();
    const matched = coins.filter((c) => ids.has(c.id));
    if (matched.length === 0) return { ...s, score: null, change: null, count: 0 };
    const avgChange = matched.reduce((a, c) => a + (c.price_change_percentage_24h ?? 0), 0) / matched.length;
    const totalVol = matched.reduce((a, c) => a + (c.total_volume ?? 0), 0);
    const totalMcap = matched.reduce((a, c) => a + (c.market_cap ?? 0), 0);
    const score = momentumScore({
      priceChange24h: avgChange,
      priceChange7d: matched.reduce((a, c) => a + (c.price_change_percentage_7d_in_currency ?? 0), 0) / matched.length,
      volume24h: totalVol,
      marketCap: totalMcap,
    });
    return { ...s, score, change: avgChange, count: matched.length };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Momentum</CardTitle>
        <Badge variant="outline">24h heuristic</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {rows.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/sectors/${r.slug}`}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent/40"
              >
                <span className="text-sm font-medium">{r.name}</span>
                <span className="text-[10px] text-muted-foreground">{r.count} coins</span>
                <div className="ml-auto flex items-center gap-3">
                  <span
                    className={`num text-xs ${(r.change ?? 0) >= 0 ? "text-bull" : "text-bear"}`}
                  >
                    {r.change != null ? `${r.change >= 0 ? "+" : ""}${r.change.toFixed(2)}%` : "—"}
                  </span>
                  <MomentumBar score={r.score ?? 0} />
                  <span className="num w-7 text-right text-xs text-muted-foreground">
                    {r.score ?? "—"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MomentumBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="h-1.5 w-24 rounded-full bg-border">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

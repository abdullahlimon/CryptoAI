import { fetchJson } from "./fetcher";

const BASE = "https://api.dexscreener.com";

export type DSPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd: string;
  priceChange: { h1?: number; h6?: number; h24?: number };
  txns: { h24: { buys: number; sells: number } };
  volume: { h24: number };
  liquidity: { usd: number };
  fdv: number;
  marketCap?: number;
  pairCreatedAt?: number;
};

export async function dsTokenPairs(chain: string, address: string): Promise<DSPair[]> {
  const r = await fetchJson<{ pairs: DSPair[] }>(`${BASE}/latest/dex/tokens/${address}`, {
    revalidate: 60,
  });
  return (r.pairs ?? []).filter((p) => p.chainId === chain);
}

/** Best (highest-liquidity) pair across all chains for a token. */
export async function dsBestPair(address: string): Promise<DSPair | null> {
  const r = await fetchJson<{ pairs: DSPair[] }>(`${BASE}/latest/dex/tokens/${address}`, {
    revalidate: 60,
  });
  const pairs = r.pairs ?? [];
  if (pairs.length === 0) return null;
  return pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
}

export async function dsSearch(query: string): Promise<DSPair[]> {
  const r = await fetchJson<{ pairs: DSPair[] }>(`${BASE}/latest/dex/search`, {
    revalidate: 30,
    searchParams: { q: query },
  });
  return r.pairs ?? [];
}

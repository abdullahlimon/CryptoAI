import { fetchJson } from "./fetcher";

const BASE = "https://api.coingecko.com/api/v3";

function headers(): Record<string, string> {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

export type CGMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  price_change_percentage_30d_in_currency: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
};

export async function cgTopMarkets(perPage = 250, page = 1): Promise<CGMarketCoin[]> {
  return fetchJson<CGMarketCoin[]>(`${BASE}/coins/markets`, {
    headers: headers(),
    revalidate: 60,
    searchParams: {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perPage,
      page,
      sparkline: false,
      price_change_percentage: "24h,7d,30d",
    },
  });
}

export type CGGlobal = {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
};
export async function cgGlobal(): Promise<CGGlobal> {
  return fetchJson<CGGlobal>(`${BASE}/global`, { headers: headers(), revalidate: 120 });
}

export type CGTrending = {
  coins: Array<{
    item: {
      id: string;
      coin_id: number;
      name: string;
      symbol: string;
      market_cap_rank: number | null;
      thumb: string;
      data?: {
        price?: number;
        price_change_percentage_24h?: { usd?: number };
        market_cap?: string;
        total_volume?: string;
      };
    };
  }>;
};
export async function cgTrending(): Promise<CGTrending> {
  return fetchJson<CGTrending>(`${BASE}/search/trending`, { headers: headers(), revalidate: 120 });
}

export type CGCoinDetail = {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
  description: { en: string };
  links: {
    homepage: string[];
    twitter_screen_name: string | null;
  };
  image: { small: string; large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    fully_diluted_valuation: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
  };
  platforms: Record<string, string>;
};
export async function cgCoin(id: string): Promise<CGCoinDetail> {
  return fetchJson<CGCoinDetail>(`${BASE}/coins/${id}`, {
    headers: headers(),
    revalidate: 300,
    searchParams: {
      localization: false,
      tickers: false,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  });
}

export type CGSearchHit = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
};
export type CGSearch = {
  coins: CGSearchHit[];
};

export async function cgSearch(query: string): Promise<CGSearch> {
  return fetchJson<CGSearch>(`${BASE}/search`, {
    headers: headers(),
    revalidate: 300,
    searchParams: { query },
  });
}

/**
 * Resolve a possibly-stale CoinGecko id (e.g. `zcoin` → `firo`).
 * Tries the direct lookup; on 404, searches by id/symbol and returns the
 * best-ranked match. Returns null when nothing matches.
 */
export async function cgResolveId(id: string): Promise<string | null> {
  try {
    const c = await cgCoin(id);
    return c.id;
  } catch (err) {
    if (!(err instanceof Error) || !/http 404/.test(err.message)) return null;
  }
  try {
    const { coins } = await cgSearch(id);
    if (!coins.length) return null;
    const exact = coins.find(
      (c) => c.id === id || c.symbol.toLowerCase() === id.toLowerCase(),
    );
    return (exact ?? coins[0]).id;
  } catch {
    return null;
  }
}

export type CGMarketChart = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};
export async function cgMarketChart(id: string, days = 7): Promise<CGMarketChart> {
  return fetchJson<CGMarketChart>(`${BASE}/coins/${id}/market_chart`, {
    headers: headers(),
    revalidate: 300,
    searchParams: { vs_currency: "usd", days },
  });
}

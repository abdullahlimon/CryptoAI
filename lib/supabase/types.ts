// Hand-rolled types for the tables we read most. Regenerate with
// `supabase gen types typescript` once you've linked a project.

export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  rank: number | null;
  price_usd: number | null;
  market_cap: number | null;
  fdv: number | null;
  volume_24h: number | null;
  liquidity_usd: number | null;
  price_change_24h: number | null;
  price_change_7d: number | null;
  price_change_30d: number | null;
  ath: number | null;
  ath_change_pct: number | null;
  circulating: number | null;
  total_supply: number | null;
  max_supply: number | null;
  categories: string[];
  contracts: Record<string, string>;
  homepage: string | null;
  twitter: string | null;
  description: string | null;
  risk_score: number | null;
  narrative_score: number | null;
  updated_at: string;
};

export type Sector = {
  slug: string;
  name: string;
  description: string | null;
  category_keys: string[];
  market_cap: number | null;
  volume_24h: number | null;
  change_24h: number | null;
  change_7d: number | null;
  momentum_score: number | null;
  narrative_strength: number | null;
  inflow_24h: number | null;
  top_coins: string[];
  updated_at: string;
};

export type NewsItem = {
  id: string;
  source: string;
  url: string;
  title: string;
  summary: string | null;
  sentiment: "bullish" | "bearish" | "neutral" | null;
  sentiment_score: number | null;
  coins: string[];
  sectors: string[];
  published_at: string;
  fetched_at: string;
};

export type AIReport = {
  id: string;
  target_kind: "coin" | "sector" | "market" | "watchlist";
  target_id: string;
  report_type: "summary" | "thesis" | "risk" | "narrative";
  prompt_hash: string;
  model: string;
  provider: "groq" | "gemini" | "ollama";
  content: string;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
  expires_at: string | null;
};

export type Watchlist = {
  id: string;
  coin_id: string;
  tags: string[];
  notes: string | null;
  favorite: boolean;
  created_at: string;
};

export type Alert = {
  id: string;
  coin_id: string;
  kind: "price" | "volume" | "whale" | "sentiment" | "narrative";
  operator: string | null;
  threshold: number | null;
  window_min: number | null;
  active: boolean;
  last_fired_at: string | null;
  created_at: string;
};

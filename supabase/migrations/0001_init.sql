-- ============================================================
-- CryptoAI Terminal — initial schema
-- Personal research tool. RLS enabled but permissive on the
-- single-user assumption: tighten if you ever expose this.
-- ============================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------
-- coins: master record per asset
-- ----------------------------------------------------------------
create table if not exists coins (
  id              text primary key,                 -- coingecko id (e.g. 'bitcoin')
  symbol          text not null,
  name            text not null,
  image           text,
  rank            int,
  price_usd       numeric,
  market_cap      numeric,
  fdv             numeric,
  volume_24h      numeric,
  liquidity_usd   numeric,
  price_change_24h numeric,
  price_change_7d  numeric,
  price_change_30d numeric,
  ath             numeric,
  ath_change_pct  numeric,
  circulating     numeric,
  total_supply    numeric,
  max_supply      numeric,
  categories      text[] default '{}',
  contracts       jsonb default '{}'::jsonb,        -- { "ethereum": "0x...", ... }
  homepage        text,
  twitter         text,
  description     text,
  risk_score      int,                              -- 0-100, computed
  narrative_score int,                              -- 0-100, computed
  updated_at      timestamptz not null default now()
);
create index if not exists coins_market_cap_idx on coins (market_cap desc nulls last);
create index if not exists coins_volume_idx on coins (volume_24h desc nulls last);
create index if not exists coins_change_idx on coins (price_change_24h desc nulls last);
create index if not exists coins_categories_gin on coins using gin (categories);

-- ----------------------------------------------------------------
-- sectors: AI, RWA, DePIN, L2, Gaming, Memes, etc.
-- ----------------------------------------------------------------
create table if not exists sectors (
  slug              text primary key,
  name              text not null,
  description       text,
  category_keys     text[] default '{}',            -- coingecko category slugs that map here
  market_cap        numeric,
  volume_24h        numeric,
  change_24h        numeric,
  change_7d         numeric,
  momentum_score    int,                            -- 0-100
  narrative_strength int,                           -- 0-100
  inflow_24h        numeric,
  top_coins         text[] default '{}',
  updated_at        timestamptz not null default now()
);

-- many-to-many coin <-> sector (computed from coingecko categories)
create table if not exists coin_sectors (
  coin_id     text references coins(id) on delete cascade,
  sector_slug text references sectors(slug) on delete cascade,
  primary key (coin_id, sector_slug)
);

-- ----------------------------------------------------------------
-- metrics: per-coin timeseries (price/volume/liquidity)
-- Keep small: aggregate or prune older than 30d.
-- ----------------------------------------------------------------
create table if not exists metrics (
  coin_id   text not null references coins(id) on delete cascade,
  ts        timestamptz not null,
  price     numeric,
  volume    numeric,
  liquidity numeric,
  market_cap numeric,
  primary key (coin_id, ts)
);
create index if not exists metrics_ts_idx on metrics (ts desc);

-- ----------------------------------------------------------------
-- narratives: detected/curated themes (e.g. "AI agents", "BTC L2")
-- ----------------------------------------------------------------
create table if not exists narratives (
  slug          text primary key,
  name          text not null,
  keywords      text[] default '{}',
  related_sectors text[] default '{}',
  strength      int,                                -- 0-100
  delta_24h     int,                                -- change vs prior period
  summary       text,
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- news: aggregated headlines + sentiment
-- ----------------------------------------------------------------
create table if not exists news (
  id            text primary key,                   -- source id or url hash
  source        text not null,
  url           text not null,
  title         text not null,
  summary       text,
  sentiment     text,                               -- bullish | bearish | neutral
  sentiment_score numeric,                          -- -1.0 .. 1.0
  coins         text[] default '{}',
  sectors       text[] default '{}',
  published_at  timestamptz not null,
  fetched_at    timestamptz not null default now()
);
create index if not exists news_published_idx on news (published_at desc);
create index if not exists news_coins_gin on news using gin (coins);

-- ----------------------------------------------------------------
-- ai_reports: cache for AI-generated text
-- key on target + type + prompt_hash so reruns are reused.
-- ----------------------------------------------------------------
create table if not exists ai_reports (
  id           uuid primary key default gen_random_uuid(),
  target_kind  text not null,                       -- coin | sector | market | watchlist
  target_id    text not null,                       -- e.g. coin id, sector slug, 'global'
  report_type  text not null,                       -- summary | thesis | risk | narrative
  prompt_hash  text not null,
  model        text not null,
  provider     text not null,                       -- groq | gemini | ollama
  content      text not null,
  tokens_in    int,
  tokens_out   int,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz                          -- null = never expire
);
create unique index if not exists ai_reports_cache_key
  on ai_reports (target_kind, target_id, report_type, prompt_hash);
create index if not exists ai_reports_target_idx on ai_reports (target_kind, target_id, created_at desc);

-- ----------------------------------------------------------------
-- watchlists + alerts (single-user)
-- ----------------------------------------------------------------
create table if not exists watchlists (
  id          uuid primary key default gen_random_uuid(),
  coin_id     text not null references coins(id) on delete cascade,
  tags        text[] default '{}',
  notes       text,
  favorite    boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index if not exists watchlists_coin_uniq on watchlists (coin_id);

create table if not exists alerts (
  id           uuid primary key default gen_random_uuid(),
  coin_id      text not null references coins(id) on delete cascade,
  kind         text not null,                       -- price | volume | whale | sentiment | narrative
  operator     text,                                -- '>' | '<' | 'pct_change'
  threshold    numeric,
  window_min   int,                                 -- timeframe (minutes)
  active       boolean not null default true,
  last_fired_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists alerts_active_idx on alerts (active) where active;

-- ----------------------------------------------------------------
-- whale_events: optional, populated later from on-chain providers
-- ----------------------------------------------------------------
create table if not exists whale_events (
  id          uuid primary key default gen_random_uuid(),
  coin_id     text references coins(id) on delete set null,
  tx_hash     text,
  chain       text,
  from_addr   text,
  to_addr     text,
  amount_usd  numeric,
  kind        text,                                 -- inflow | outflow | dex_swap | bridge
  ts          timestamptz not null,
  created_at  timestamptz not null default now()
);
create index if not exists whale_events_ts_idx on whale_events (ts desc);

-- ----------------------------------------------------------------
-- ingest_runs: audit log so we know what data is fresh
-- ----------------------------------------------------------------
create table if not exists ingest_runs (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,
  status      text not null,                        -- ok | error
  rows_in     int,
  rows_out    int,
  error       text,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists ingest_runs_source_idx on ingest_runs (source, started_at desc);

-- ----------------------------------------------------------------
-- RLS: enable + permissive single-user policies
-- (you authenticate as service-role from server; client uses anon
-- read-only for this personal app)
-- ----------------------------------------------------------------
alter table coins         enable row level security;
alter table sectors       enable row level security;
alter table coin_sectors  enable row level security;
alter table metrics       enable row level security;
alter table narratives    enable row level security;
alter table news          enable row level security;
alter table ai_reports    enable row level security;
alter table watchlists    enable row level security;
alter table alerts        enable row level security;
alter table whale_events  enable row level security;
alter table ingest_runs   enable row level security;

-- read-only for anon
do $$ begin
  create policy anon_read_coins        on coins        for select using (true);
  create policy anon_read_sectors      on sectors      for select using (true);
  create policy anon_read_coin_sectors on coin_sectors for select using (true);
  create policy anon_read_metrics      on metrics      for select using (true);
  create policy anon_read_narratives   on narratives   for select using (true);
  create policy anon_read_news         on news         for select using (true);
  create policy anon_read_ai_reports   on ai_reports   for select using (true);
  create policy anon_read_watchlists   on watchlists   for select using (true);
  create policy anon_read_alerts       on alerts       for select using (true);
  create policy anon_read_whale_events on whale_events for select using (true);
exception when duplicate_object then null; end $$;

-- service role bypasses RLS automatically; no insert policies needed for anon.

# CryptoAI Terminal

Personal AI-powered crypto research terminal. Built for one user, on free tiers.

> Not a SaaS. Not a financial advisor. A dashboard for your own research.

## Stack

| Layer    | Tool                                                  | Why |
|----------|-------------------------------------------------------|-----|
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind + shadcn | Free on Vercel; server components keep the bundle small |
| Backend  | Supabase (Postgres + Auth + Edge Functions)           | Generous free tier, RLS, cron, edge functions |
| Charts   | TradingView widgets + Recharts                        | Free, professional-grade |
| AI       | Router over **Groq → Gemini → Ollama**                | Free / generous-free tiers + zero-cost local fallback |
| Data     | CoinGecko, DexScreener, DefiLlama, Alternative.me F&G, CryptoPanic | All free APIs |

## Why this architecture

External APIs go through **Supabase Edge Functions on a cron schedule**, write to Postgres, and Next.js reads only from Supabase. This avoids rate limits and keeps the dashboard fast even when the upstream provider is slow. The AI layer caches generated text in `ai_reports` keyed by a prompt hash, so the same question is never billed twice.

```
External APIs ──cron──▶ Supabase (Postgres) ──server components──▶ Next.js (Vercel)
                                                                       │
                                                                       ▼
                                                              AI Router (Groq | Gemini | Ollama)
                                                                       │
                                                                       ▼
                                                                cached AI reports
```

## Getting started

```bash
# 1. Install
pnpm install     # or npm install / yarn

# 2. Configure
cp .env.example .env.local
# Fill in at least: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, and one of GROQ_API_KEY / GEMINI_API_KEY.
# (CoinGecko works without a key on the free tier.)

# 3. Apply schema (using Supabase CLI)
supabase db push                                  # or run supabase/migrations/0001_init.sql in the SQL editor
psql "$DATABASE_URL" -f supabase/seed.sql         # seeds default sectors

# 4. Dev
npm run dev
```

The dashboard works **without** Supabase — widgets gracefully degrade. You only need it for the watchlist, alerts, and AI cache.

## Free API keys

| Provider      | Where                                                                 | Required? |
|---------------|-----------------------------------------------------------------------|-----------|
| Groq          | https://console.groq.com                                              | recommended (fastest free LLM) |
| Gemini        | https://aistudio.google.com/app/apikey                                | recommended (fallback) |
| Ollama        | `brew install ollama && ollama pull llama3.1`                         | optional local fallback |
| Supabase      | https://supabase.com (free tier)                                      | for watchlist/alerts/cache |
| CoinGecko     | https://www.coingecko.com/en/api/pricing (demo key raises rate limit) | optional |
| CryptoPanic   | https://cryptopanic.com/developers/api                                | optional (news) |

## Project layout

```
app/
  page.tsx                  # Dashboard
  coin/[id]/page.tsx        # Coin research page (TradingView + AI report)
  sectors/page.tsx          # Sector momentum tracker
  watchlist/page.tsx
  alerts/page.tsx
  api/ai/route.ts           # Cached AI completion endpoint
  api/watchlist/route.ts
components/
  widgets/                  # GlobalStats, FearGreed, Movers, Trending, ...
  charts/tradingview.tsx
  layout/top-nav.tsx
  ui/                       # shadcn primitives
lib/
  ai/                       # router + groq/gemini/ollama providers + prompts
  providers/                # coingecko, dexscreener, defillama, cryptopanic, fng
  scoring/momentum.ts       # momentum + risk heuristics
  supabase/{server,client,types}.ts
supabase/
  migrations/0001_init.sql  # full schema
  seed.sql                  # default sectors
```

## Cost rules baked in

- **Server components first** — no client-side fetches to upstream APIs.
- **ISR / `next.revalidate`** on every external call (60s for prices, 300s for coin detail, 600s for F&G).
- **AI write-through cache** in `ai_reports` keyed by `(target, type, prompt_hash)` with TTL.
- **Provider router with fallback** — if Groq is down, fall back to Gemini, then Ollama. Never pay for retries.
- **No websockets yet** — polling + ISR is enough at this scale and free.

## Roadmap (next sessions)

1. Supabase Edge Functions for ingestion (`ingest-prices`, `ingest-news`, `ingest-sectors`) on cron.
2. Per-sector deep-dive pages with inflows + AI sector brief.
3. Alerts engine (price / volume / sentiment) on a 5-min cron.
4. Whale events via Alchemy/Moralis free tier.
5. Optional Ollama-backed batch sentiment classification of news headlines.

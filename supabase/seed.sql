-- Seed default sectors with their CoinGecko category mappings.
-- These let the ingestion job route coins -> sectors.

insert into sectors (slug, name, description, category_keys) values
  ('ai',     'AI',         'AI agents, ML infrastructure, and AI-adjacent tokens.',
   array['artificial-intelligence', 'ai-agents', 'ai-meme-coins', 'made-in-usa', 'generative-ai']),
  ('rwa',    'RWA',        'Real-world assets: tokenized treasuries, credit, equities.',
   array['real-world-assets-rwa', 'tokenized-assets', 'tokenized-treasury-bills']),
  ('depin',  'DePIN',      'Decentralized physical infrastructure networks.',
   array['depin']),
  ('l2',     'Layer 2',    'Ethereum and Bitcoin L2 rollups and scaling networks.',
   array['layer-2', 'zero-knowledge-zk', 'optimistic-rollup', 'bitcoin-layer-2']),
  ('gaming', 'Gaming',     'Web3 gaming, GameFi, and on-chain games.',
   array['gaming', 'gaming-metaverse', 'play-to-earn']),
  ('memes',  'Memes',      'Meme coins and culture tokens.',
   array['meme-token', 'dog-themed-coins', 'cat-themed-coins', 'frog-themed-coins']),
  ('defi',   'DeFi',       'Lending, DEXs, perps, yield, derivatives.',
   array['decentralized-finance-defi', 'decentralized-exchange', 'perpetuals']),
  ('liquid_staking', 'Liquid Staking', 'LSTs and restaking.',
   array['liquid-staking-tokens', 'liquid-restaking-tokens', 'eigenlayer-restaking']),
  ('solana_eco', 'Solana Eco', 'Tokens in the Solana ecosystem.',
   array['solana-ecosystem']),
  ('base_eco',   'Base Eco',   'Tokens on Base.',
   array['base-ecosystem'])
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category_keys = excluded.category_keys;

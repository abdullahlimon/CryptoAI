import { clamp } from "@/lib/utils";

/**
 * Composite momentum score (0-100) blending price change, volume,
 * and (optionally) sentiment. Heuristic — tune as you collect data.
 */
export function momentumScore(input: {
  priceChange24h?: number | null;
  priceChange7d?: number | null;
  volume24h?: number | null;
  marketCap?: number | null;
  sentiment?: number | null; // -1..1
}): number {
  const p24 = input.priceChange24h ?? 0;
  const p7 = input.priceChange7d ?? 0;
  const turnover =
    input.marketCap && input.marketCap > 0 && input.volume24h
      ? input.volume24h / input.marketCap
      : 0;
  const sent = input.sentiment ?? 0;

  // Map components to 0-100 contributions.
  const priceComp = clamp(50 + p24 * 1.5 + p7 * 0.7, 0, 100);   // 24h heavily weighted
  const turnoverComp = clamp(turnover * 500, 0, 100);            // 20% turnover -> 100
  const sentComp = clamp(50 + sent * 50, 0, 100);

  return Math.round(priceComp * 0.55 + turnoverComp * 0.3 + sentComp * 0.15);
}

/**
 * Risk score (0-100). Higher = riskier. Penalises tiny mcap, low
 * liquidity-to-mcap ratio, and high FDV/MC dilution.
 */
export function riskScore(input: {
  marketCap?: number | null;
  liquidityUsd?: number | null;
  fdv?: number | null;
  ageDays?: number | null;
}): number {
  const mc = input.marketCap ?? 0;
  const liq = input.liquidityUsd ?? 0;
  const fdv = input.fdv ?? mc;
  const age = input.ageDays ?? 365;

  let r = 50;
  if (mc < 1_000_000) r += 30;
  else if (mc < 10_000_000) r += 18;
  else if (mc < 100_000_000) r += 8;
  else if (mc > 1_000_000_000) r -= 12;

  const liqRatio = mc > 0 ? liq / mc : 0;
  if (liqRatio < 0.01) r += 15;
  else if (liqRatio > 0.1) r -= 6;

  const dilution = mc > 0 ? fdv / mc : 1;
  if (dilution > 5) r += 12;
  else if (dilution > 2) r += 5;

  if (age < 30) r += 15;
  else if (age < 180) r += 5;

  return clamp(Math.round(r), 0, 100);
}

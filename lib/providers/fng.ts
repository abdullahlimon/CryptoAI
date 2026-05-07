import { fetchJson } from "./fetcher";

export type FNG = {
  value: number;            // 0-100
  classification: string;   // "Extreme Fear" .. "Extreme Greed"
  timestamp: number;
};

type Resp = {
  data: Array<{ value: string; value_classification: string; timestamp: string }>;
};

export async function getFearGreed(): Promise<FNG | null> {
  try {
    const r = await fetchJson<Resp>("https://api.alternative.me/fng/", {
      revalidate: 600,
      searchParams: { limit: 1 },
    });
    const x = r.data?.[0];
    if (!x) return null;
    return {
      value: Number(x.value),
      classification: x.value_classification,
      timestamp: Number(x.timestamp) * 1000,
    };
  } catch {
    return null;
  }
}

import { fetchJson } from "./fetcher";

const BASE = "https://api.llama.fi";

export type LlamaCategory = {
  name: string;
  tvl: number;
  change_1d: number | null;
  change_7d: number | null;
};
export async function llamaCategories(): Promise<LlamaCategory[]> {
  return fetchJson<LlamaCategory[]>(`${BASE}/categories`, { revalidate: 600 });
}

export type LlamaChain = {
  gecko_id: string | null;
  tvl: number;
  tokenSymbol: string | null;
  cmcId: string | null;
  name: string;
  chainId: number | null;
};
export async function llamaChains(): Promise<LlamaChain[]> {
  return fetchJson<LlamaChain[]>(`${BASE}/v2/chains`, { revalidate: 600 });
}

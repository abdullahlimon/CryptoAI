import { fetchJson } from "./fetcher";

export type CPPost = {
  id: number;
  kind: string;
  domain: string;
  source: { title: string; domain: string; path: string };
  title: string;
  published_at: string;
  url: string;
  currencies?: Array<{ code: string; title: string; slug: string; url: string }>;
  votes?: { negative: number; positive: number; important: number; liked: number; disliked: number };
};

type Resp = { results: CPPost[] };

/**
 * CryptoPanic free API. Without a key the public feed is reachable but
 * heavily rate-limited; we fall back to RSS-style aggregation if the
 * env var is missing.
 */
export async function cpFeed(opts?: { kind?: "news" | "media"; filter?: "rising" | "hot" | "important" | "saved" | "lol" | "bullish" | "bearish"; currencies?: string[] }): Promise<CPPost[]> {
  const key = process.env.CRYPTOPANIC_API_KEY;
  if (!key) return [];
  try {
    const r = await fetchJson<Resp>("https://cryptopanic.com/api/v1/posts/", {
      revalidate: 300,
      searchParams: {
        auth_token: key,
        public: "true",
        kind: opts?.kind,
        filter: opts?.filter,
        currencies: opts?.currencies?.join(","),
      },
    });
    return r.results ?? [];
  } catch {
    return [];
  }
}

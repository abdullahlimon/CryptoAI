/**
 * Tiny fetch wrapper with timeout, retries on 429/5xx, and Next.js
 * `revalidate` support so server components benefit from edge caching.
 */
type FetchOpts = {
  revalidate?: number;       // Next ISR seconds; default 60
  tags?: string[];
  timeoutMs?: number;        // default 10s
  retries?: number;          // default 2
  headers?: Record<string, string>;
  searchParams?: Record<string, string | number | boolean | undefined>;
};

export async function fetchJson<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const {
    revalidate = 60,
    tags,
    timeoutMs = 10_000,
    retries = 2,
    headers = {},
    searchParams,
  } = opts;

  const u = new URL(url);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
    }
  }

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(u.toString(), {
        headers: { accept: "application/json", ...headers },
        signal: controller.signal,
        next: { revalidate, tags },
      });
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`upstream ${res.status}`);
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`http ${res.status}: ${text.slice(0, 200)}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    } finally {
      clearTimeout(tid);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("fetchJson failed");
}

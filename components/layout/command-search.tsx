"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, CornerDownLeft, Loader2 } from "lucide-react";
import { prettifyCoinName, prettifyCoinSymbol } from "@/lib/format/coin";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  rank: number | null;
};

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const modalInputRef = React.useRef<HTMLInputElement>(null);

  // Cmd/Ctrl-K toggle.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus modal input when opened.
  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => modalInputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced search.
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const json = await res.json();
        setHits(json.coins ?? []);
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  const navigate = (id: string) => {
    setOpen(false);
    setQuery("");
    setHits([]);
    router.push(`/coin/${id}`);
  };

  const onInlineFocus = () => setOpen(true);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      navigate(hits[active].id);
    }
  };

  return (
    <>
      {/* Inline trigger (visible md+) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        onFocus={onInlineFocus}
        className="hidden h-7 min-w-[200px] items-center gap-2 rounded-md border border-border bg-background/60 px-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:inline-flex"
        aria-label="Search coins"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 truncate">Search coins…</span>
        <kbd className="rounded border border-border bg-secondary px-1 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Mobile icon-only trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/60 text-muted-foreground hover:text-foreground md:hidden"
        aria-label="Search coins"
      >
        <Search className="h-3.5 w-3.5" />
      </button>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={modalInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search coins by name or symbol…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
                spellCheck={false}
              />
              {loading && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Type at least 2 characters.{" "}
                  <span className="font-mono">↑↓</span> to navigate,{" "}
                  <span className="font-mono">↵</span> to open.
                </div>
              ) : !loading && hits.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No coins match "{query}".
                </div>
              ) : (
                <ul className="py-1">
                  {hits.map((h, i) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => navigate(h.id)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                          i === active ? "bg-accent" : "hover:bg-accent/50",
                        )}
                      >
                        {h.rank != null && (
                          <span className="num w-7 shrink-0 text-right text-[10px] text-muted-foreground">
                            #{h.rank}
                          </span>
                        )}
                        {h.thumb ? (
                          <Image
                            src={h.thumb}
                            alt=""
                            width={18}
                            height={18}
                            className="shrink-0 rounded-full ring-1 ring-border"
                          />
                        ) : (
                          <span className="h-[18px] w-[18px] shrink-0 rounded-full bg-secondary" />
                        )}
                        <span className="font-mono text-xs font-semibold uppercase">
                          {prettifyCoinSymbol(h.symbol)}
                        </span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="min-w-0 truncate text-xs text-muted-foreground">
                          {prettifyCoinName(h.name, h.symbol)}
                        </span>
                        {i === active && (
                          <CornerDownLeft className="ml-auto h-3 w-3 shrink-0 text-primary" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-background/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>CoinGecko</span>
              <span>esc to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden sr-only — keep ref alive for inline focus pattern */}
      <input ref={inputRef} type="hidden" />
    </>
  );
}

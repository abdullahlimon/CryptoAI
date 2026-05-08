import Image from "next/image";
import { prettifyCoinName, prettifyCoinSymbol } from "@/lib/format/coin";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  symbol: string;
  image?: string | null;
  rank?: number | null;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Canonical rendering of a coin's identity in lists.
 *
 * Layout:  [icon] SYMBOL · Name
 *           tiny  mono     muted
 *
 * Always uses prettify* helpers so the trending endpoint's "jtoJito" /
 * "dydxdYdX" mashups render cleanly.
 */
export function CoinCell({
  name,
  symbol,
  image,
  rank,
  size = "md",
  className,
}: Props) {
  const sym = prettifyCoinSymbol(symbol);
  const nm = prettifyCoinName(name, symbol);
  const px = size === "sm" ? 16 : 20;

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {rank != null && (
        <span className="num w-5 shrink-0 text-right text-[10px] text-muted-foreground">
          {rank}
        </span>
      )}
      {image ? (
        <Image
          src={image}
          alt=""
          width={px}
          height={px}
          className="shrink-0 rounded-full ring-1 ring-border"
        />
      ) : (
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-muted-foreground">
          {sym.slice(0, 2)}
        </span>
      )}
      <span
        className={cn(
          "shrink-0 font-mono font-semibold uppercase tracking-wide",
          size === "sm" ? "text-[11px]" : "text-xs",
        )}
      >
        {sym}
      </span>
      <span className="text-muted-foreground/60">·</span>
      <span
        className={cn(
          "min-w-0 truncate text-muted-foreground",
          size === "sm" ? "text-[11px]" : "text-xs",
        )}
        title={nm}
      >
        {nm}
      </span>
    </div>
  );
}

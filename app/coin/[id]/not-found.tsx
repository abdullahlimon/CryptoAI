import Link from "next/link";
import { TerminalSquare, ArrowLeft } from "lucide-react";

export default function CoinNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-md border border-border bg-card p-10 text-center">
      <TerminalSquare className="h-8 w-8 text-primary" />
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          ERR_COIN_NOT_FOUND
        </p>
        <h1 className="mt-1 text-lg font-semibold">No data for this asset.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The slug may have been renamed or delisted on CoinGecko.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-accent"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>
    </div>
  );
}

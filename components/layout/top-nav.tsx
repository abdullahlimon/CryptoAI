import Link from "next/link";
import { TrendingUp, LineChart, Star, Bell, Sparkles } from "lucide-react";
import { CommandSearch } from "@/components/layout/command-search";

const NAV = [
  { href: "/", label: "Dashboard", icon: LineChart },
  { href: "/sectors", label: "Sectors", icon: TrendingUp },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-[1440px] items-center gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-mono text-sm font-bold"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">CRYPTOAI</span>
          <span className="hidden text-muted-foreground sm:inline">
            / TERMINAL
          </span>
          <span className="sm:hidden">CAI</span>
        </Link>

        <nav className="flex items-center gap-0.5 font-mono text-xs">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <CommandSearch />
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground lg:inline">
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary align-middle" />
            live
          </span>
        </div>
      </div>
    </header>
  );
}

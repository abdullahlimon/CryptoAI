import Link from "next/link";
import { TrendingUp, LineChart, Star, Bell, Sparkles } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LineChart },
  { href: "/sectors", label: "Sectors", icon: TrendingUp },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-[1440px] items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>CRYPTOAI</span>
          <span className="text-muted-foreground">/ TERMINAL</span>
        </Link>
        <nav className="flex items-center gap-1 text-xs font-mono">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          live · polling
        </div>
      </div>
    </header>
  );
}

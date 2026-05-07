"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WatchlistToggle({ coinId, initial }: { coinId: string; initial: boolean }) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();

  const onToggle = () => {
    const next = !active;
    setActive(next); // optimistic
    start(async () => {
      try {
        await fetch("/api/watchlist", {
          method: next ? "POST" : "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ coin_id: coinId }),
        });
      } catch {
        setActive(!next); // rollback
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      disabled={pending}
      className={cn(active && "border-primary/40 bg-primary/10 text-primary")}
    >
      <Star className={cn("h-3.5 w-3.5", active && "fill-current")} />
      {active ? "Saved" : "Save"}
    </Button>
  );
}

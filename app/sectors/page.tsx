import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SECTORS } from "@/lib/sectors";
import { SectorMomentum } from "@/components/widgets/sector-momentum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 120;

export default function SectorsPage() {
  return (
    <div className="space-y-3">
      <h1 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
        Sector Tracker
      </h1>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectorMomentum />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Sectors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/60">
              {SECTORS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/sectors/${s.slug}`}
                    className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/40"
                  >
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.blurb}
                      </div>
                    </div>
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

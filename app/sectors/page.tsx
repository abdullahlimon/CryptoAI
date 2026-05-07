import { SectorMomentum } from "@/components/widgets/sector-momentum";

export const revalidate = 120;

export default function SectorsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
        Sector Tracker
      </h1>
      <SectorMomentum />
    </div>
  );
}

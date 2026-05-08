import { Skeleton } from "@/components/ui/skeleton";

export default function SectorLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-[64px] w-full" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}

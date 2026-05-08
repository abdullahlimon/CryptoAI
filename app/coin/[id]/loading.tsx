import { Skeleton } from "@/components/ui/skeleton";

export default function CoinLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[64px] w-full" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Skeleton className="h-[460px] w-full lg:col-span-2" />
        <Skeleton className="h-[460px] w-full" />
      </div>
    </div>
  );
}

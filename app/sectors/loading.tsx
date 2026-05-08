import { Skeleton } from "@/components/ui/skeleton";

export default function SectorsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Skeleton className="h-[420px] w-full lg:col-span-2" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </div>
  );
}

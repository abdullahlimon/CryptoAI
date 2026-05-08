import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "bull" | "bear" | "neutral";
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "lift relative flex flex-col overflow-hidden",
        tone === "bull" && "before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-bull/60",
        tone === "bear" && "before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-bear/60",
        className,
      )}
    >
      <CardHeader className="border-b-0 pb-1">
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end pt-0">
        <div
          className={cn(
            "num text-2xl font-semibold tracking-tight",
            tone === "bull" && "text-bull",
            tone === "bear" && "text-bear",
          )}
        >
          {value}
        </div>
        {sub && (
          <div className="num mt-1 text-xs text-muted-foreground">{sub}</div>
        )}
      </CardContent>
    </Card>
  );
}

import { getFearGreed } from "@/lib/providers/fng";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function tone(value: number) {
  if (value <= 24) return { color: "text-bear", label: "extreme fear" };
  if (value <= 44) return { color: "text-bear/80", label: "fear" };
  if (value <= 55) return { color: "text-muted-foreground", label: "neutral" };
  if (value <= 74) return { color: "text-bull/80", label: "greed" };
  return { color: "text-bull", label: "extreme greed" };
}

export async function FearGreedWidget() {
  const fng = await getFearGreed();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fear &amp; Greed</CardTitle>
      </CardHeader>
      <CardContent>
        {fng ? (
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className={`num text-3xl font-bold ${tone(fng.value).color}`}>
                {fng.value}
              </div>
              <div className="mt-1 text-xs uppercase text-muted-foreground">
                {fng.classification}
              </div>
            </div>
            <FNGGauge value={fng.value} />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Unavailable</div>
        )}
      </CardContent>
    </Card>
  );
}

function FNGGauge({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const stroke =
    value <= 24
      ? "hsl(var(--bear))"
      : value <= 44
      ? "hsl(var(--bear) / 0.7)"
      : value <= 55
      ? "hsl(var(--muted-foreground))"
      : value <= 74
      ? "hsl(var(--bull) / 0.7)"
      : "hsl(var(--bull))";
  return (
    <svg viewBox="0 0 72 72" width={64} height={64}>
      <circle cx={36} cy={36} r={r} stroke="hsl(var(--border))" strokeWidth={6} fill="none" />
      <circle
        cx={36}
        cy={36}
        r={r}
        stroke={stroke}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 36 36)"
      />
    </svg>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
  return (
    <Card>
      <CardHeader><CardTitle>Alerts</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Coming next session: price / volume / sentiment alerts evaluated by a Supabase Edge cron job.
          Schema is already in <code>supabase/migrations/0001_init.sql</code>.
        </p>
      </CardContent>
    </Card>
  );
}

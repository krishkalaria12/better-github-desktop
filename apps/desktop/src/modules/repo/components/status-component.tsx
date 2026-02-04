import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatusSnapshot() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">status snapshot</p>
        <CardTitle className="mt-2 text-lg">System readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3">
          <StatusRow label="auth status" value="verified" accent />
          <StatusRow label="clone path" value="ready" accent={false} />
          <StatusRow label="sync mode" value="optimized" accent={false} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">secure auth</Badge>
          <Badge variant="outline">fast sync</Badge>
          <Badge variant="outline">offline ready</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
      <span className="text-foreground">{label}</span>
      <span className={accent ? "text-primary" : "text-muted-foreground"}>{value}</span>
    </div>
  );
}

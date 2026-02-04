import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LocalRepoCard({ onOpenLocal }: { onOpenLocal: () => Promise<void> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">open local</p>
          <CardTitle className="mt-2 text-lg">Add a local repo</CardTitle>
        </div>
        <Badge variant="outline">local</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Browse for a folder on this machine and connect it instantly to your workspace.
        </p>
        <Button onClick={onOpenLocal} className="h-11 w-full">
          Add local repo
        </Button>
      </CardContent>
    </Card>
  );
}

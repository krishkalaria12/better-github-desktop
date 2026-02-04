import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { FileStatus } from "@/modules/workspace/api/tauri-git-api";

interface BranchSummaryProps {
  branchName: string;
  changes: FileChange[];
}

const statusLabels = {
  New: "new",
  Modified: "modified",
  Deleted: "deleted",
} as const;

type StatusLabel = (typeof statusLabels)[keyof typeof statusLabels];

const normalizeStatus = (status: FileChange["status"]) => {
  if (typeof status === "number") {
    return FileStatus[status] ?? "Modified";
  }
  return status;
};

export function BranchSummary({ branchName, changes }: BranchSummaryProps) {
  const counts = changes.reduce<Record<StatusLabel, number>>(
    (acc, change) => {
      const key = normalizeStatus(change.status);
      const label = statusLabels[key as keyof typeof statusLabels] ?? "modified";
      acc[label] += 1;
      return acc;
    },
    { new: 0, modified: 0, deleted: 0 }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              current branch
            </p>
            <CardTitle className="mt-2 text-lg">{branchName}</CardTitle>
          </div>
          <Badge variant="secondary">{changes.length} changes</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline">{counts.new} new</Badge>
        <Badge variant="outline">{counts.modified} modified</Badge>
        <Badge variant="outline">{counts.deleted} deleted</Badge>
      </CardContent>
    </Card>
  );
}

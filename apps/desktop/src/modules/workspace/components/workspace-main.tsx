import { DiffViewer } from "@/modules/workspace/components/diff-viewer";
import { useGetDiffChanges } from "@/modules/workspace/hooks/use-git-changes";
import { useCommitFileDiff } from "@/modules/commits/hooks/use-commit-diff";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkspaceMainProps {
  selectedPath: string | null;
  activeTab: "changes" | "history";
  selectedCommitId: string | null;
  selectedCommitFile: string | null;
}

export function WorkspaceMain({
  selectedPath,
  activeTab,
  selectedCommitId,
  selectedCommitFile,
}: WorkspaceMainProps) {
  const isCommitDiff = activeTab === "history" && Boolean(selectedCommitId && selectedCommitFile);
  const { data: diffChanges, isLoading: isWorkspaceLoading } = useGetDiffChanges(
    isCommitDiff ? undefined : selectedPath ?? undefined
  );
  const { data: commitDiff, isLoading: isCommitLoading } = useCommitFileDiff(
    isCommitDiff ? selectedCommitId ?? undefined : undefined,
    isCommitDiff ? selectedCommitFile ?? undefined : undefined
  );

  const diffItems = isCommitDiff
    ? commitDiff
      ? [{ old_content: commitDiff.old_content, new_content: commitDiff.new_content }]
      : []
    : Array.isArray(diffChanges)
      ? diffChanges
      : diffChanges
        ? [diffChanges]
        : [];

  const statusLabel = isCommitDiff
    ? isCommitLoading
      ? "loading"
      : selectedCommitFile
        ? "ready"
        : "idle"
    : isWorkspaceLoading
      ? "loading"
      : selectedPath
        ? "ready"
        : "idle";

  const modeLabel = isCommitDiff ? "commit diff" : "workspace diff";
  const fileLabel = isCommitDiff
    ? selectedCommitFile ?? "No file selected"
    : selectedPath ?? "No file selected";

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{modeLabel}</p>
          <div className="mt-1 truncate text-sm font-semibold text-foreground">{fileLabel}</div>
        </div>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.2em]">
          {statusLabel}
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <Card className="flex min-h-0 flex-1 flex-col border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">diff preview</p>
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
              {diffItems.length} {diffItems.length === 1 ? "file" : "files"}
            </Badge>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 p-0">
            <ScrollArea className="h-full px-4 py-4">
              <DiffViewer
                filePath={isCommitDiff ? selectedCommitFile ?? "" : selectedPath ?? ""}
                diffs={diffItems}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

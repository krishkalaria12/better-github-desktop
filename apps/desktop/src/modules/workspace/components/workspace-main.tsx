import { DiffViewer } from "@/modules/workspace/components/diff-viewer";
import { useGetDiffChanges } from "@/modules/workspace/hooks/use-git-changes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkspaceMainProps {
  repoLabel: string;
  repoPath: string;
  selectedPath: string | null;
}

export function WorkspaceMain({ repoLabel, repoPath, selectedPath }: WorkspaceMainProps) {
  const { data: diffChanges, isLoading } = useGetDiffChanges(selectedPath ?? undefined);
  const diffs = diffChanges ?? [];

  return (
    <main className="flex min-h-screen min-w-0 flex-1 flex-col px-8 py-10">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-6">
        <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.28em]">
          workspace overview
        </Badge>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{repoLabel}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{repoPath}</p>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Badge variant="secondary">local</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8 grid flex-1 gap-6">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">diff preview</p>
              <CardTitle className="mt-2 text-xl">
                {selectedPath ?? "Pick a file"}
              </CardTitle>
            </div>
            <Badge variant="outline">{isLoading ? "loading" : "ready"}</Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <DiffViewer filePath={selectedPath ?? ""} diffs={diffs} />
          </CardContent>
        </Card>

      </div>
    </main>
  );
}

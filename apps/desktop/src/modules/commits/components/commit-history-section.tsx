import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommitHistory } from "../api/tuari-commit-api";
import { useCommitHistory } from "../hooks/use-commit-history";

const formatCommitDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

export function CommitHistorySection({ repoPath }: { repoPath: string }) {
  const { data, isLoading, isError, error } = useCommitHistory(repoPath);
  const raw = data as CommitHistory[] | CommitHistory | undefined;
  const commits = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load commit history.";

  return (
    <Card className="flex h-[320px] flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">commit history</p>
          <CardTitle className="mt-2 text-lg">Recent commits</CardTitle>
        </div>
        <Badge variant="secondary">{commits.length}</Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {!repoPath ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              Open a repository to load commit history.
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              {errorMessage}
            </div>
          ) : commits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              No commit history available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {commits.map((commit) => (
                <div
                  key={commit.oid}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{commit.message}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {commit.author_name} • {formatCommitDate(commit.date)}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {commit.short_oid}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

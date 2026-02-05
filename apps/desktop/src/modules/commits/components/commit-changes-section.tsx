import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommitChanges } from "../hooks/use-commit-changes";
import type { CommitFileChange } from "../api/tuari-commit-api";

const statusLabelMap: Record<string, { label: string; className: string }> = {
  A: { label: "added", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" },
  M: { label: "modified", className: "border-amber-500/30 bg-amber-500/10 text-amber-600" },
  D: { label: "deleted", className: "border-rose-500/30 bg-rose-500/10 text-rose-600" },
  R: { label: "renamed", className: "border-sky-500/30 bg-sky-500/10 text-sky-600" },
  U: { label: "unknown", className: "border-border/60 bg-muted/30 text-muted-foreground" },
};

export function CommitChangesSection({ repoPath }: { repoPath: string }) {
  const [inputCommit, setInputCommit] = useState("");
  const [activeCommit, setActiveCommit] = useState("");
  const { data, isLoading, isError, error } = useCommitChanges(activeCommit, repoPath);
  const changes = (data ?? []) as CommitFileChange[];
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load commit changes.";

  const handleLoad = () => {
    setActiveCommit(inputCommit.trim());
  };

  return (
    <Card className="flex h-[320px] flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            repo changes by commit
          </p>
          <CardTitle className="mt-2 text-lg">Commit file changes</CardTitle>
        </div>
        <Badge variant="secondary">{changes.length}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 p-0">
        <div className="px-4">
          <div className="flex flex-wrap gap-2">
            <Input
              value={inputCommit}
              onChange={(event) => setInputCommit(event.target.value)}
              placeholder="Commit SHA (e.g. a1b2c3d)"
              className="h-10 flex-1"
            />
            <Button onClick={handleLoad} disabled={!inputCommit.trim()} className="h-10">
              Load
            </Button>
          </div>
        </div>

        <ScrollArea className="h-full px-4 pb-4">
          {!activeCommit ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              Enter a commit SHA to review file changes.
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              {errorMessage}
            </div>
          ) : changes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              No file changes reported for this commit.
            </div>
          ) : (
            <div className="space-y-3">
              {changes.map((change) => {
                const status = statusLabelMap[String(change.status)] ?? statusLabelMap.U;
                return (
                  <div
                    key={`${change.path}-${change.status}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="break-words text-sm font-medium text-foreground">
                        {change.path}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">commit change</div>
                    </div>
                    <Badge className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.2em] ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

import { useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommitFileChange } from "../api/tuari-commit-api";
import { useRepoChangeByCommit } from "../hooks/use-commit-history";

interface CommitChangesListProps {
  repoPath: string;
  commitId: string | null;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
}

const statusLabelMap: Record<string, { label: string; short: string; className: string }> = {
  A: { label: "added", short: "A", className: "border-emerald-500/40 text-emerald-500" },
  M: { label: "modified", short: "M", className: "border-amber-500/40 text-amber-500" },
  D: { label: "deleted", short: "D", className: "border-rose-500/40 text-rose-500" },
  R: { label: "renamed", short: "R", className: "border-sky-500/40 text-sky-500" },
  U: { label: "unknown", short: "?", className: "border-border/60 text-muted-foreground" },
};

export function CommitChangesList({
  repoPath,
  commitId,
  selectedPath,
  onSelectPath,
}: CommitChangesListProps) {
  const { data, isLoading, isError, error } = useRepoChangeByCommit(commitId ?? "", repoPath);
  const changes = (data ?? []) as CommitFileChange[];
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load commit changes.";

  useEffect(() => {
    if (changes.length === 0) {
      return;
    }
    const selectedExists = selectedPath
      ? changes.some((change) => change.path === selectedPath)
      : false;
    if (!selectedExists) {
      onSelectPath(changes[0].path);
    }
  }, [changes, onSelectPath, selectedPath]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">files</p>
        <span className="text-xs text-muted-foreground">{changes.length} files</span>
      </div>
      <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
        {!commitId ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            Select a commit to view file changes.
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            {errorMessage}
          </div>
        ) : changes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            No file changes reported for this commit.
          </div>
        ) : (
          <div className="space-y-2">
            {changes.map((change) => {
              const status = statusLabelMap[String(change.status)] ?? statusLabelMap.U;
              const isActive = selectedPath === change.path;
              return (
                <button
                  key={`${change.path}-${change.status}`}
                  type="button"
                  onClick={() => onSelectPath(change.path)}
                  className={
                    "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition " +
                    (isActive
                      ? "border-border/80 bg-muted/60"
                      : "border-border/60 bg-background/70 hover:bg-muted/40")
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{change.path}</div>
                  </div>
                  <span
                    className={`flex h-5 w-6 items-center justify-center rounded border text-[10px] font-semibold uppercase ${status.className}`}
                    aria-label={status.label}
                  >
                    {status.short}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

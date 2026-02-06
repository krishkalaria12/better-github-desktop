import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommitHistory } from "../api/tuari-commit-api";
import { useCommitHistory } from "../hooks/use-commit-history";
import { type MouseEvent, useEffect } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

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

interface CommitHistorySectionProps {
  repoPath: string;
  selectedCommitId: string | null;
  onSelectCommit: (commitId: string) => void;
}

export function CommitHistorySection({
  repoPath,
  selectedCommitId,
  onSelectCommit,
}: CommitHistorySectionProps) {
  const { data, isLoading, isError, error } = useCommitHistory(repoPath);
  const raw = data as CommitHistory[] | CommitHistory | undefined;
  const commits = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load commit history.";

  useEffect(() => {
    if (commits.length === 0) {
      return;
    }
    const selectedExists = selectedCommitId
      ? commits.some((commit) => commit.oid === selectedCommitId)
      : false;
    if (!selectedExists) {
      onSelectCommit(commits[0].oid);
    }
  }, [commits, onSelectCommit, selectedCommitId]);

  const handleCopyHash = async (event: MouseEvent, hash: string) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      toast.success("Commit hash copied");
    } catch {
      toast.error("Could not copy commit hash");
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">history</p>
        <span className="text-xs text-muted-foreground">{commits.length} commits</span>
      </div>
      <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
        {!repoPath ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            Open a repository to load commit history.
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            {errorMessage}
          </div>
        ) : commits.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            No commit history available yet.
          </div>
        ) : (
          <div className="space-y-2">
            {commits.map((commit) => {
              const isActive = selectedCommitId === commit.oid;
              return (
                <div
                  key={commit.oid}
                  onClick={() => onSelectCommit(commit.oid)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectCommit(commit.oid);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={
                    "flex w-full cursor-pointer items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left transition " +
                    (isActive
                      ? "border-border/80 bg-muted/60"
                      : "border-border/60 bg-background/70 hover:bg-muted/40")
                  }
                  aria-pressed={isActive}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {commit.message}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {commit.author_name} • {formatCommitDate(commit.date)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => handleCopyHash(event, commit.oid)}
                    className="shrink-0 cursor-pointer rounded border border-border/60 px-2 py-1 font-mono text-[10px] text-muted-foreground transition hover:bg-muted"
                    title="Copy full commit hash"
                  >
                    <span className="inline-flex items-center gap-1">
                      {commit.short_oid}
                      <Copy className="h-3 w-3" />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

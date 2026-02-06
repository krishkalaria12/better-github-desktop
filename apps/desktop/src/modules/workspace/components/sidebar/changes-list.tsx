import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FileStatus } from "@/modules/workspace/api/tauri-git-api";
import { useCommit } from "@/modules/commits/hooks/use-commit-changes";
import { useStageAllFiles, useStageFile } from "@/modules/staging/hooks/use-staging";
import { useUnStageAllFiles, useUnStageFile } from "@/modules/staging/hooks/use-unstaging";
import { Check, GitCommitHorizontal, GitPullRequestArrow, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ChangesListProps {
  repoPath: string;
  changes: FileChange[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function ChangesList({
  repoPath,
  changes,
  isLoading,
  isError,
  errorMessage,
  selectedPath,
  onSelect,
}: ChangesListProps) {
  const [stagedMap, setStagedMap] = useState<Record<string, FileChange>>({});
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  const stageFileMutation = useStageFile();
  const stageAllMutation = useStageAllFiles();
  const unstageFileMutation = useUnStageFile();
  const unstageAllMutation = useUnStageAllFiles();
  const commitMutation = useCommit();

  const stagedChanges = useMemo(() => Object.values(stagedMap), [stagedMap]);
  const unstagedChanges = useMemo(
    () => changes.filter((change) => !stagedMap[change.path]),
    [changes, stagedMap]
  );

  useEffect(() => {
    if (changes.length === 0 && !isLoading) {
      setStagedMap({});
    }
  }, [changes, isLoading]);

  const counts = changes.reduce(
    (acc, change) => {
      const status = typeof change.status === "number" ? FileStatus[change.status] : change.status;
      if (status === "New") {
        acc.new += 1;
      } else if (status === "Deleted") {
        acc.deleted += 1;
      } else {
        acc.modified += 1;
      }
      return acc;
    },
    { new: 0, modified: 0, deleted: 0 }
  );

  const isMutating =
    stageFileMutation.isPending ||
    stageAllMutation.isPending ||
    unstageFileMutation.isPending ||
    unstageAllMutation.isPending ||
    commitMutation.isPending;

  const handleStageFile = (change: FileChange) => {
    setStagedMap((current) => ({ ...current, [change.path]: change }));
    stageFileMutation.mutate(
      { filePath: change.path, repoPath },
      {
        onError: () => {
          setStagedMap((current) => {
            const next = { ...current };
            delete next[change.path];
            return next;
          });
          toast.error("Could not stage file");
        },
      }
    );
  };

  const handleUnstageFile = (change: FileChange) => {
    setStagedMap((current) => {
      const next = { ...current };
      delete next[change.path];
      return next;
    });
    unstageFileMutation.mutate(
      { filePath: change.path, repoPath },
      {
        onError: () => {
          setStagedMap((current) => ({ ...current, [change.path]: change }));
          toast.error("Could not unstage file");
        },
      }
    );
  };

  const handleStageAll = () => {
    if (unstagedChanges.length === 0) {
      return;
    }
    setStagedMap((current) => {
      const next = { ...current };
      for (const change of unstagedChanges) {
        next[change.path] = change;
      }
      return next;
    });
    stageAllMutation.mutate(
      { repoPath },
      {
        onError: () => {
          setStagedMap({});
          toast.error("Could not stage all files");
        },
      }
    );
  };

  const handleUnstageAll = () => {
    if (stagedChanges.length === 0) {
      return;
    }
    const snapshot = stagedMap;
    setStagedMap({});
    unstageAllMutation.mutate(
      { repoPath },
      {
        onError: () => {
          setStagedMap(snapshot);
          toast.error("Could not unstage all files");
        },
      }
    );
  };

  const handleCommit = () => {
    const trimmedSummary = summary.trim();
    const trimmedDescription = description.trim();
    if (!trimmedSummary || stagedChanges.length === 0) {
      return;
    }
    const message = trimmedDescription
      ? `${trimmedSummary}\n\n${trimmedDescription}`
      : trimmedSummary;

    commitMutation.mutate(
      { message, repoPath },
      {
        onSuccess: () => {
          setSummary("");
          setDescription("");
          setStagedMap({});
          toast.success("Commit created");
        },
        onError: () => {
          toast.error("Commit failed");
        },
      }
    );
  };

  const renderChangeRow = (change: FileChange, mode: "stage" | "unstage") => {
    const status = typeof change.status === "number" ? FileStatus[change.status] : change.status;
    const badgeMap: Record<string, string> = {
      New: "border-emerald-500/40 text-emerald-500",
      Modified: "border-amber-500/40 text-amber-500",
      Deleted: "border-rose-500/40 text-rose-500",
    };
    return (
      <div
        key={`${mode}-${change.path}`}
        className={`flex items-center gap-2 rounded-lg border px-2 py-2 transition ${
          selectedPath === change.path
            ? "border-border/80 bg-muted/60"
            : "border-border/60 bg-background/70 hover:bg-muted/40"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(change.path)}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <div className="truncate text-sm font-medium text-foreground">{change.path}</div>
        </button>
        <span
          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${badgeMap[status] ?? "border-border/60 text-muted-foreground"}`}
        >
          {status === "New" ? "A" : status === "Deleted" ? "D" : "M"}
        </span>
        <Button
          type="button"
          size="sm"
          variant={mode === "stage" ? "secondary" : "outline"}
          className="h-7 px-2"
          onClick={() => (mode === "stage" ? handleStageFile(change) : handleUnstageFile(change))}
          disabled={isMutating}
        >
          {mode === "stage" ? <Plus className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">working tree</p>
        <span className="text-xs text-muted-foreground">
          {unstagedChanges.length} unstaged • {stagedChanges.length} staged
        </span>
      </div>
      <div className="flex flex-wrap gap-2 px-4 pb-2">
        <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-[0.2em]">
          {counts.new} new
        </Badge>
        <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-[0.2em]">
          {counts.modified} modified
        </Badge>
        <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-[0.2em]">
          {counts.deleted} deleted
        </Badge>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-2 gap-3 px-3 pb-3">
        <Card className="flex min-h-0 flex-col border-border/60 bg-background/40">
          <CardHeader className="flex flex-row items-center justify-between px-3 py-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">unstaged</p>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleStageAll} disabled={isMutating || unstagedChanges.length === 0}>
              <Check className="mr-1 h-3.5 w-3.5" /> stage all
            </Button>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 px-2 pb-2 pt-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="space-y-2 p-1">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : isError ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                  {errorMessage ?? "Unable to load file status. Check the repo path."}
                </div>
              ) : unstagedChanges.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                  All detected changes are staged.
                </div>
              ) : (
                <div className="space-y-2 p-1">{unstagedChanges.map((change) => renderChangeRow(change, "stage"))}</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-col border-border/60 bg-background/40">
          <CardHeader className="flex flex-row items-center justify-between px-3 py-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">staged</p>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleUnstageAll} disabled={isMutating || stagedChanges.length === 0}>
              <GitPullRequestArrow className="mr-1 h-3.5 w-3.5" /> unstage all
            </Button>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 px-2 pb-2 pt-0">
            <ScrollArea className="h-full">
              {stagedChanges.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
                  Stage files to prepare your next commit.
                </div>
              ) : (
                <div className="space-y-2 p-1">{stagedChanges.map((change) => renderChangeRow(change, "unstage"))}</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-border/60 px-3 py-3">
        <div className="space-y-2">
          <Input
            placeholder="Commit summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            maxLength={72}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-20 resize-none"
          />
          <Button
            className="w-full"
            onClick={handleCommit}
            disabled={isMutating || !summary.trim() || stagedChanges.length === 0}
          >
            <GitCommitHorizontal className="mr-2 h-4 w-4" />
            {commitMutation.isPending ? "Committing..." : `Commit ${stagedChanges.length} file${stagedChanges.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

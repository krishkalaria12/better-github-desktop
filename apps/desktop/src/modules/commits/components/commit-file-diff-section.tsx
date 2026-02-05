import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DiffViewer } from "@/modules/workspace/components/diff-viewer";
import { useCommitFileDiff } from "../hooks/use-commit-diff";
import type { CommitDiffState } from "../api/tuari-commit-api";

export function CommitFileDiffSection() {
  const [commitInput, setCommitInput] = useState("");
  const [fileInput, setFileInput] = useState("");
  const [activeCommit, setActiveCommit] = useState("");
  const [activeFile, setActiveFile] = useState("");

  const { data, isLoading, isError, error } = useCommitFileDiff(activeCommit, activeFile);
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load diff by commit.";

  const handleLoad = () => {
    setActiveCommit(commitInput.trim());
    setActiveFile(fileInput.trim());
  };

  const diffItems = data
    ? [
        {
          old_content: (data as CommitDiffState).old_content,
          new_content: (data as CommitDiffState).new_content,
        },
      ]
    : [];

  return (
    <Card className="flex h-[420px] flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            file diff by commit
          </p>
          <CardTitle className="mt-2 text-lg">Commit file diff</CardTitle>
        </div>
        <Badge variant="secondary">diff</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            value={commitInput}
            onChange={(event) => setCommitInput(event.target.value)}
            placeholder="Commit SHA"
            className="h-10 flex-1"
          />
          <Input
            value={fileInput}
            onChange={(event) => setFileInput(event.target.value)}
            placeholder="Path to file"
            className="h-10 flex-1"
          />
          <Button
            onClick={handleLoad}
            disabled={!commitInput.trim() || !fileInput.trim()}
            className="h-10"
          >
            Load
          </Button>
        </div>

        {!activeCommit || !activeFile ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            Enter a commit SHA and file path to view the diff.
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            {errorMessage}
          </div>
        ) : (
          <DiffViewer filePath={activeFile} diffs={diffItems} />
        )}
      </CardContent>
    </Card>
  );
}

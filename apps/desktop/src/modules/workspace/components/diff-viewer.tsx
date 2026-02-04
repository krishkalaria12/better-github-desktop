import { MultiFileDiff } from "@pierre/diffs/react";
import { useTheme } from "@/components/theme-provider";
import type { DiffChange } from "@/modules/workspace/api/tauri-git-api";

interface DiffViewerProps {
  filePath: string;
  diffs: DiffChange[] | DiffChange | null | undefined;
}

export function DiffViewer({ filePath, diffs }: DiffViewerProps) {
  const diffItems = Array.isArray(diffs) ? diffs : diffs ? [diffs] : [];
  const { theme } = useTheme();
  const diffTheme = theme === "dark" ? "pierre-dark" : "pierre-light";

  if (!filePath) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-sm text-muted-foreground">
        Select a file from the sidebar to preview its diff.
      </div>
    );
  }

  if (diffItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-sm text-muted-foreground">
        No diff data returned for this file yet.
      </div>
    );
  }

  return (
    <div className="diff-viewer space-y-6">
      {diffItems.map((diff, index) => (
        <div
          key={`${filePath}-${index}`}
          className="overflow-hidden rounded-xl border border-border/60 bg-background"
        >
          <MultiFileDiff
            oldFile={{ name: filePath, contents: diff.old_content }}
            newFile={{ name: filePath, contents: diff.new_content }}
            options={{ theme: diffTheme, diffStyle: "split" }}
          />
        </div>
      ))}
    </div>
  );
}

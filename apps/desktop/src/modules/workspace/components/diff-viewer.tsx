import { MultiFileDiff } from "@pierre/diffs/react";
import type { DiffChange } from "@/modules/workspace/api/tauri-git-api";

interface DiffViewerProps {
  filePath: string;
  diffs: DiffChange[] | DiffChange | null | undefined;
}

export function DiffViewer({ filePath, diffs }: DiffViewerProps) {
  const diffItems = Array.isArray(diffs) ? diffs : diffs ? [diffs] : [];

  if (!filePath) {
    return (
      <div className="border border-dashed border-black/15 bg-white/70 px-6 py-10 text-sm text-[#6a6157]">
        Select a file from the sidebar to preview its diff.
      </div>
    );
  }

  if (diffItems.length === 0) {
    return (
      <div className="border border-dashed border-black/15 bg-white/70 px-6 py-10 text-sm text-[#6a6157]">
        No diff data returned for this file yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {diffItems.map((diff, index) => (
        <div key={`${filePath}-${index}`} className="overflow-hidden border border-black/10 bg-white">
          <MultiFileDiff
            oldFile={{ name: filePath, contents: diff.old_content }}
            newFile={{ name: filePath, contents: diff.new_content }}
            options={{ theme: "pierre-light", diffStyle: "split" }}
          />
        </div>
      ))}
    </div>
  );
}

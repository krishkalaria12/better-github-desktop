import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeRow } from "@/modules/workspace/components/sidebar/change-row";

interface ChangesListProps {
  changes: FileChange[];
  isLoading: boolean;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function ChangesList({ changes, isLoading, selectedPath, onSelect }: ChangesListProps) {
  return (
    <div className="rounded-none border border-black/10 bg-white/80 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#7a6f62]">
          git changes
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#7a6f62]">
          {changes.length} files
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : changes.length === 0 ? (
          <div className="rounded-none border border-black/10 bg-[#f7f2ea] px-3 py-4 text-sm text-[#6a6157]">
            No file changes detected yet. Pull or edit files to populate this list.
          </div>
        ) : (
          changes.map((change) => (
            <ChangeRow
              key={`${change.path}-${change.status}`}
              change={change}
              isSelected={selectedPath === change.path}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

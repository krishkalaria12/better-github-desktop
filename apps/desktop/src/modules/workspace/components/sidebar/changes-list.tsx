import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeRow } from "@/modules/workspace/components/sidebar/change-row";
import { FileStatus } from "@/modules/workspace/api/tauri-git-api";

interface ChangesListProps {
  changes: FileChange[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function ChangesList({
  changes,
  isLoading,
  isError,
  errorMessage,
  selectedPath,
  onSelect,
}: ChangesListProps) {
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">changes</p>
        <span className="text-xs text-muted-foreground">{changes.length} files</span>
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
      <ScrollArea className="flex-1 px-3 pb-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            {errorMessage ?? "Unable to load file status. Check the repo path."}
          </div>
        ) : changes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
            No local changes yet. Pull or edit files to populate this list.
          </div>
        ) : (
          <div className="space-y-2">
            {changes.map((change) => (
              <ChangeRow
                key={`${change.path}-${change.status}`}
                change={change}
                isSelected={selectedPath === change.path}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

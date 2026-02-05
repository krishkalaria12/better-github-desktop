import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeRow } from "@/modules/workspace/components/sidebar/change-row";

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
  return (
    <Card className="flex h-[420px] flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">git changes</p>
        </div>
        <span className="text-xs text-muted-foreground">{changes.length} files</span>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              {errorMessage ?? "Unable to load file status. Check the repo path."}
            </div>
          ) : changes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              No file changes detected yet. Pull or edit files to populate this list.
            </div>
          ) : (
            <div className="space-y-3">
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
      </CardContent>
    </Card>
  );
}

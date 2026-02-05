import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { BranchType } from "../api/tauri-branch-api";
import { useGetBranches } from "../hooks/use-get-branch";

const normalizeBranchType = (typeOf: BranchType["type_of"]) => {
  if (typeof typeOf === "string") {
    return typeOf.toLowerCase();
  }
  return typeOf === 0 ? "remote" : "local";
};

export function BranchSection() {
  const { data, isLoading } = useGetBranches();
  const raw = data as BranchType[] | BranchType | undefined;
  const branches = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const sortedBranches = [...branches].sort((a, b) => {
    if (a.is_head && !b.is_head) return -1;
    if (!a.is_head && b.is_head) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="flex h-[280px] flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">branches</p>
          <CardTitle className="mt-2 text-lg">Active branches</CardTitle>
        </div>
        <Badge variant="secondary">{branches.length}</Badge>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              No branches returned yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBranches.map((branch) => (
                <div
                  key={`${branch.name}-${branch.type_of}`}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{branch.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {branch.is_head ? "current head" : "available"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {branch.is_head ? <Badge>head</Badge> : null}
                    <Badge variant="outline">{normalizeBranchType(branch.type_of)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

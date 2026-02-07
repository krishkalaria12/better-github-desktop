import { Folder, RefreshCw } from "lucide-react";

import { BranchManager } from "@/modules/branches/components/branch-manager";
import { useGetBranches } from "@/modules/branches/hooks/use-get-branch";
import { useAuthStore } from "@/store/github-client";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

const getRepoLabel = (repoPath: string | null) => {
  if (!repoPath) {
    return "workspace";
  }
  const trimmed = repoPath.replace(/[\\/]+$/, "");
  const lastSegment = trimmed.split(/[\\/]/).filter(Boolean).pop();
  return lastSegment ?? "workspace";
};

export default function Header() {
  const { last_opened_repo } = useAuthStore();
  const { data } = useGetBranches({ enabled: Boolean(last_opened_repo) });
  const branches = Array.isArray(data) ? data : data ? [data] : [];
  const currentBranch = branches.find((branch) => branch.is_head)?.name ?? branches[0]?.name ?? "main";
  const repoLabel = getRepoLabel(last_opened_repo);
  const repoPath = last_opened_repo ?? "No repository selected";
  const isRepoSelected = Boolean(last_opened_repo);

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="flex h-12 w-full items-center gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
            <Folder className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{repoLabel}</div>
            <div className="truncate text-[11px] text-muted-foreground">{repoPath}</div>
          </div>
        </div>

        <BranchManager
          repoPath={last_opened_repo}
          currentBranch={currentBranch}
          isRepoSelected={isRepoSelected}
        />

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" className="h-8" disabled={!isRepoSelected}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Fetch origin
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

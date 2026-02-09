import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Folder, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { confirm } from "@tauri-apps/plugin-dialog";

import { BranchManager } from "@/modules/branches/components/branch-manager";
import { useGetBranches } from "@/modules/branches/hooks/use-get-branch";
import { RemoteSyncMenu } from "@/modules/repo/components/remote-sync-menu";
import { useAuthStore } from "@/store/github-client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
  const navigate = useNavigate();
  const { last_opened_repo, opened_repos, token, setActiveRepo, removeRepo, logout } = useAuthStore();
  const { data } = useGetBranches({
    enabled: Boolean(last_opened_repo),
    repoPath: last_opened_repo,
  });
  const branches = Array.isArray(data) ? data : data ? [data] : [];
  const currentBranch = branches.find((branch) => branch.is_head)?.name ?? branches[0]?.name ?? "main";
  const repoLabel = getRepoLabel(last_opened_repo);
  const repoPath = last_opened_repo ?? "No repository selected";
  const isRepoSelected = Boolean(last_opened_repo);

  const handleSelectRepo = async (repoPathValue: string) => {
    await setActiveRepo(repoPathValue);
    toast.success(`Switched to ${getRepoLabel(repoPathValue)}`);
  };

  const handleRemoveActiveRepo = async () => {
    if (!last_opened_repo) {
      return;
    }

    const shouldRemove = await confirm(
      "This will remove the current repository from your viewed list. You can add it again later by opening or validating it.",
      {
        title: "Remove repository from view?",
        kind: "warning",
        okLabel: "Remove",
        cancelLabel: "Cancel",
      }
    );

    if (!shouldRemove) {
      return;
    }

    const removedLabel = getRepoLabel(last_opened_repo);
    await removeRepo(last_opened_repo);
    toast.success(`Removed ${removedLabel} from viewed repositories`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="h-8 gap-2" disabled={!opened_repos.length}>
                Repos
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" sideOffset={8} className="w-[360px] rounded-md">
            <DropdownMenuLabel>Viewed repositories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {opened_repos.length ? (
              opened_repos.map((openedRepoPath) => (
                <DropdownMenuItem key={openedRepoPath} onClick={() => void handleSelectRepo(openedRepoPath)}>
                  <div className="flex w-full min-w-0 items-center gap-2">
                    <Check
                      className={`h-3.5 w-3.5 ${
                        openedRepoPath === last_opened_repo ? "text-foreground" : "text-transparent"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{getRepoLabel(openedRepoPath)}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{openedRepoPath}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No repositories yet</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!last_opened_repo}
              onClick={() => void handleRemoveActiveRepo()}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove current repo from view
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <BranchManager
          repoPath={last_opened_repo}
          currentBranch={currentBranch}
          isRepoSelected={isRepoSelected}
        />

        <div className="ml-auto flex items-center gap-2">
          <RemoteSyncMenu
            repoPath={last_opened_repo}
            token={token}
            currentBranch={currentBranch}
            isRepoSelected={isRepoSelected}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={() => void handleLogout()}
            disabled={!token}
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

import { BranchSummary } from "@/modules/workspace/components/sidebar/branch-summary";
import { ChangesList } from "@/modules/workspace/components/sidebar/changes-list";
import { SidebarHeader } from "@/modules/workspace/components/sidebar/sidebar-header";
import { useGetRepoChanges } from "@/modules/workspace/hooks/use-git-changes";
import { BranchSection } from "@/modules/branches/components/branch-section";
import { CommitHistorySection } from "@/modules/commits/components/commit-history-section";

interface WorkspaceSidebarProps {
  repoLabel: string;
  repoPath: string;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
}

export function WorkspaceSidebar({ repoLabel, repoPath, selectedPath, onSelectPath }: WorkspaceSidebarProps) {
  const { data, isLoading, isError, error } = useGetRepoChanges(repoPath);
  const changes = data ?? [];
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load file status. Check the repo path.";

  return (
    <aside className="flex min-h-screen w-[320px] shrink-0 flex-col border-r border-border/60 bg-card/80 px-6 py-8 backdrop-blur">
      <SidebarHeader repoLabel={repoLabel} repoPath={repoPath} />
      <div className="mt-8 flex flex-col gap-6">
        <BranchSummary branchName="main" changes={changes} />
        <BranchSection />
        <CommitHistorySection repoPath={repoPath} />
        <ChangesList
          changes={changes}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          selectedPath={selectedPath}
          onSelect={onSelectPath}
        />
      </div>
    </aside>
  );
}

import { BranchSummary } from "@/modules/workspace/components/sidebar/branch-summary";
import { ChangesList } from "@/modules/workspace/components/sidebar/changes-list";
import { SidebarHeader } from "@/modules/workspace/components/sidebar/sidebar-header";
import { useGetRepoChanges } from "@/modules/workspace/hooks/use-git-changes";

interface WorkspaceSidebarProps {
  repoLabel: string;
  repoPath: string;
}

export function WorkspaceSidebar({ repoLabel, repoPath }: WorkspaceSidebarProps) {
  const { data, isLoading } = useGetRepoChanges();
  const changes = data ?? [];

  return (
    <aside className="flex min-h-screen w-[320px] shrink-0 flex-col border-r border-black/10 bg-white/80 px-6 py-8">
      <SidebarHeader repoLabel={repoLabel} repoPath={repoPath} />
      <div className="mt-8 flex flex-col gap-6">
        <BranchSummary branchName="main" changes={changes} />
        <ChangesList changes={changes} isLoading={isLoading} />
      </div>
    </aside>
  );
}

import { ChangesList } from "@/modules/workspace/components/sidebar/changes-list";
import { useGetRepoChanges } from "@/modules/workspace/hooks/use-git-changes";
import { CommitHistorySection } from "@/modules/commits/components/commit-history-section";
import { CommitChangesList } from "@/modules/commits/components/commit-changes-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkspaceSidebarProps {
  repoPath: string;
  selectedPath: string | null;
  onSelectPath: (path: string) => void;
  activeTab: "changes" | "history";
  onTabChange: (value: "changes" | "history") => void;
  selectedCommitId: string | null;
  selectedCommitFile: string | null;
  onSelectCommit: (commitId: string) => void;
  onSelectCommitFile: (path: string) => void;
}

export function WorkspaceSidebar({
  repoPath,
  selectedPath,
  onSelectPath,
  activeTab,
  onTabChange,
  selectedCommitId,
  selectedCommitFile,
  onSelectCommit,
  onSelectCommitFile,
}: WorkspaceSidebarProps) {
  const { data, isLoading, isError, error } = useGetRepoChanges(repoPath);
  const changes = data ?? [];
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unable to load file status. Check the repo path.";

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-border/60 bg-card/80 backdrop-blur">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as "changes" | "history")}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="border-b border-border/60 px-4 pb-3 pt-4">
          <TabsList variant="line" className="w-full justify-between">
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="changes" className="mt-0 flex min-h-0 flex-1 flex-col">
          <ChangesList
            repoPath={repoPath}
            changes={changes}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            selectedPath={selectedPath}
            onSelect={onSelectPath}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-b border-border/60">
              <CommitHistorySection
                repoPath={repoPath}
                selectedCommitId={selectedCommitId}
                onSelectCommit={onSelectCommit}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <CommitChangesList
                repoPath={repoPath}
                commitId={selectedCommitId}
                selectedPath={selectedCommitFile}
                onSelectPath={onSelectCommitFile}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

import { WorkspaceMain } from "@/modules/workspace/components/workspace-main";
import { WorkspaceSidebar } from "@/modules/workspace/components/sidebar/sidebar";
import { useState } from "react";

interface WorkspaceShellProps {
  repoPath: string;
}

export function WorkspaceShell({ repoPath }: WorkspaceShellProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"changes" | "history">("changes");
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
  const [selectedCommitFile, setSelectedCommitFile] = useState<string | null>(null);

  const handleSelectCommit = (commitId: string) => {
    setSelectedCommitId(commitId);
    setSelectedCommitFile(null);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <div className="relative flex h-full min-h-0 w-full">
        <WorkspaceSidebar
          repoPath={repoPath}
          selectedPath={selectedPath}
          onSelectPath={setSelectedPath}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedCommitId={selectedCommitId}
          selectedCommitFile={selectedCommitFile}
          onSelectCommit={handleSelectCommit}
          onSelectCommitFile={setSelectedCommitFile}
        />
        <WorkspaceMain
          selectedPath={selectedPath}
          activeTab={activeTab}
          selectedCommitId={selectedCommitId}
          selectedCommitFile={selectedCommitFile}
        />
      </div>
    </div>
  );
}

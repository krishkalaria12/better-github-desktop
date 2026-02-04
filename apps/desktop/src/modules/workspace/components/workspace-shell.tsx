import { WorkspaceMain } from "@/modules/workspace/components/workspace-main";
import { WorkspaceSidebar } from "@/modules/workspace/components/sidebar/sidebar";
import { useState } from "react";

interface WorkspaceShellProps {
  repoPath: string;
}

const getRepoLabel = (repoPath: string) => {
  if (!repoPath) {
    return "workspace";
  }
  const trimmed = repoPath.replace(/[\\/]+$/, "");
  const lastSegment = trimmed.split(/[\\/]/).filter(Boolean).pop();
  return lastSegment ?? "workspace";
};

export function WorkspaceShell({ repoPath }: WorkspaceShellProps) {
  const repoLabel = getRepoLabel(repoPath);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#1a1814]">
      <div className="flex min-h-screen w-full">
        <WorkspaceSidebar
          repoLabel={repoLabel}
          repoPath={repoPath}
          selectedPath={selectedPath}
          onSelectPath={setSelectedPath}
        />
        <WorkspaceMain
          repoLabel={repoLabel}
          repoPath={repoPath}
          selectedPath={selectedPath}
        />
      </div>
    </div>
  );
}

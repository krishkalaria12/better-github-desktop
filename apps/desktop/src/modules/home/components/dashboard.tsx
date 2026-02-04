import { cloneRepo } from "@/modules/repo/api/tauri-repo-api";
import { StartWithoutRepo } from "@/modules/repo/components/start-without-repo";
import { useCheckGitFolder } from "@/modules/repo/hooks/use-tauri-repo";
import { WorkspaceShell } from "@/modules/workspace/components/workspace-shell";
import { useAuthStore } from "@/store/github-client";
import { openFolderSelector } from "@/utils/open-folder";
import { toast } from "sonner";

export function Dashboard() {
  const { mutate: checkGitRepo } = useCheckGitFolder();
  const { setLastOpenedRepo, last_opened_repo } = useAuthStore();

  const handleCheckGitRepoLocal = async () => {
    const folder = await openFolderSelector();

    checkGitRepo(folder, {
      onSuccess: (data) => {
        if (data) {
          setLastOpenedRepo()
        } else {
          toast.error("There is no git repository for the folder");
        }
      },
      onError: (_error) => {
        toast.error("Error occurred while checking Git repository");
      }
    });
  }

  const handleCloneGitRepo = async (payload?: { url?: string; destination?: string }) => {
    if (!payload?.url || !payload?.destination) {
      toast.error("Please provide a repo URL and destination folder.");
      return;
    }

    try {
      await cloneRepo(payload.url, payload.destination);
      checkGitRepo(payload.destination, {
        onSuccess: (data) => {
          if (data) {
            setLastOpenedRepo();
            toast.success("Repository downloaded.");
          } else {
            toast.error("Clone completed, but repo validation failed.");
          }
        },
        onError: () => {
          toast.error("Clone completed, but repo validation failed.");
        },
      });
    } catch (_error) {
      const message =
        _error instanceof Error
          ? _error.message
          : typeof _error === "string"
            ? _error
            : "Failed to clone repository. Please try again.";
      toast.error(message);
    }
  };

  return (
    !last_opened_repo ? (
      <StartWithoutRepo cloneGitRepo={handleCloneGitRepo} openLocal={handleCheckGitRepoLocal} />
    ) : (
      <WorkspaceShell repoPath={last_opened_repo} />
    )
  );
}

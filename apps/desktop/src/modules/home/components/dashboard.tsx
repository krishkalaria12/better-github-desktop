import { StartWithoutRepo } from "@/modules/repo/components/start-without-repo";
import { useCheckGitFolder } from "@/modules/repo/hooks/use-tauri-repo";
import { useAuthStore } from "@/store/github-client";
import { open } from '@tauri-apps/plugin-dialog';
import { toast } from "sonner";

export function Dashboard() {
  const { mutate: checkGitRepo } = useCheckGitFolder();
  const { setLastOpenedRepo, last_opened_repo } = useAuthStore();

  const openFolderSelector = async () => {
    const file = await open({
      multiple: false,
      directory: true,
    });

    checkGitRepo(file, {
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

  return (
    !last_opened_repo ? (
      <StartWithoutRepo openfolder={openFolderSelector} />
    ) : (
      <div>Dashboard: {last_opened_repo}</div>
    )
  );
}

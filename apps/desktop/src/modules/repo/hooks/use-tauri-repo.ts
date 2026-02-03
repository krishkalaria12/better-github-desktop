import { useMutation } from "@tanstack/react-query";
import { checkIsGitRepo } from "../api/tauri-repo-api";

export function useCheckGitFolder() {
  return useMutation({
    mutationFn: async (folder_path: string | null) => {
      const response = await checkIsGitRepo(folder_path);
      return response;
    },
  });
}

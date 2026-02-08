import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkIsGitRepo, fetchOrigin } from "../api/tauri-repo-api";

export function useCheckGitFolder() {
  return useMutation({
    mutationFn: async (folder_path: string | null) => {
      const response = await checkIsGitRepo(folder_path);
      return response;
    },
  });
}

export function useFetchOrigin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { repoPath?: string | null; token?: string | null }) => {
      return await fetchOrigin(payload.repoPath, payload.token);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["branches"] }),
        queryClient.invalidateQueries({ queryKey: ["repo-changes"] }),
        queryClient.invalidateQueries({ queryKey: ["commit-history"] }),
        queryClient.invalidateQueries({ queryKey: ["diff-changes"] }),
      ]);
    },
  });
}

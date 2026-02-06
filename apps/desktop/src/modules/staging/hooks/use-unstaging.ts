import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unstageAllFiles, unstageFile } from "../api/tauri-unstaging-api";

export function useUnStageFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { filePath: string; repoPath?: string }) => {
      const response = await unstageFile(payload.filePath, payload.repoPath);
      return response;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["repo-changes", variables.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["diff-changes"] }),
      ]);
    },
  });
}

export function useUnStageAllFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { repoPath?: string }) => {
      const response = await unstageAllFiles(payload?.repoPath);
      return response;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["repo-changes", variables?.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["diff-changes"] }),
      ]);
    },
  });
}

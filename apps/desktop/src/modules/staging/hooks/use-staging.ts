import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stageAllFiles, stageFile } from "../api/tauri-staging-api";

export function useStageFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { filePath: string; repoPath?: string }) => {
      const response = await stageFile(payload.filePath, payload.repoPath);
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

export function useStageAllFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: { repoPath?: string }) => {
      const response = await stageAllFiles(payload?.repoPath);
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

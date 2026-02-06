import { useMutation } from "@tanstack/react-query";
import { stageAllFiles, stageFile } from "../api/tauri-staging-api";

export function useStageFile() {
  return useMutation({
    mutationFn: async (filePath: string, repoPath?: string) => {
      const response = await stageFile(filePath, repoPath);
      return response;
    },
  })
}

export function useStageAllFiles() {
  return useMutation({
    mutationFn: async (repoPath?: string) => {
      const response = await stageAllFiles(repoPath);
      return response;
    },
  })
}

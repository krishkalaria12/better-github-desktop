import { useMutation } from "@tanstack/react-query";
import { unstageAllFiles, unstageFile } from "../api/tauri-unstaging-api";

export function useUnStageFile() {
  return useMutation({
    mutationFn: async (filePath: string, repoPath?: string) => {
      const response = await unstageFile(filePath, repoPath);
      return response;
    },
  })
}

export function useUnStageAllFiles() {
  return useMutation({
    mutationFn: async (repoPath?: string) => {
      const response = await unstageAllFiles(repoPath);
      return response;
    },
  })
}

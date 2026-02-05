import { invoke } from "@tauri-apps/api/core";

export enum FileStatus {
  "New",
  "Deleted",
  "Modified"
}

export interface FileChange {
  path: string,
  status: FileStatus
}

export interface DiffChange {
  new_content: string,
  old_content: string
}

export async function getRepoChanges(repoPath?: string): Promise<FileChange[]> {
  return await invoke("get_repo_changes", { repoPath })
}

export async function getDiffChanges(path: string): Promise<DiffChange[]> {
  return await invoke("get_file_diff", { path })
}

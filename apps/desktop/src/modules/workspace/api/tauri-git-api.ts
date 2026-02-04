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

export async function getRepoChanges(): Promise<FileChange[]> {
  return await invoke("get_repo_changes")
}

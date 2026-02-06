import { invoke } from "@tauri-apps/api/core";

export async function unstageFile(filePath: string, repoPath?: string) {
  return await invoke("unstage_file", {
    file_path: filePath,
    repo_path: repoPath
  })
}

export async function unstageAllFiles(repoPath?: string) {
  return await invoke("unstage_all_files", {
    repo_path: repoPath
  })
}

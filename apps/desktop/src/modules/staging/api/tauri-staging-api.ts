import { invoke } from "@tauri-apps/api/core";

export async function stageFile(filePath: string, repoPath?: string) {
  return await invoke("stage_file", {
    file_path: filePath,
    repo_path: repoPath
  })
}

export async function stageAllFiles(repoPath?: string) {
  return await invoke("stage_all_files", {
    repo_path: repoPath
  })
}

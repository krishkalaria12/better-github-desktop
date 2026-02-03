import { invoke } from "@tauri-apps/api/core";

export async function checkIsGitRepo(path: string | null): Promise<boolean> {
  return await invoke("check_is_git_repo", { path });
}

export async function getLastOpenedRepo(): Promise<string> {
  return await invoke("get_last_opened_repo");
}

export async function cloneRepo(url: string, filePath: string): Promise<void> {
  await invoke("clone_repo", { url, filePath });
}

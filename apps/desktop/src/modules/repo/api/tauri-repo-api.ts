import { invoke } from "@tauri-apps/api/core";

export interface PushRepoResult {
  branch_name: string;
  remote_name: string;
  set_upstream: boolean;
}

export async function checkIsGitRepo(path: string | null): Promise<boolean> {
  return await invoke("check_is_git_repo", { path });
}

export async function getLastOpenedRepo(): Promise<string> {
  return await invoke("get_last_opened_repo");
}

export async function cloneRepo(url: string, filePath: string): Promise<void> {
  await invoke("clone_repo", { url, filePath });
}

export async function fetchRepo(repoPath?: string | null, token?: string | null): Promise<void> {
  await invoke("fetch_repo", {
    repo_path: repoPath,
    token,
  });
}

export async function pushRepo(repoPath?: string | null, token?: string | null): Promise<PushRepoResult> {
  return await invoke("push_repo", {
    repo_path: repoPath,
    token,
  });
}

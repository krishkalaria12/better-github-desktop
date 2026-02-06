import { constants } from "@/lib/constants";
import { invoke } from "@tauri-apps/api/core";

export interface CommitHistory {
  oid: string,
  short_oid: string,
  message: string,
  author_name: string,
  author_email: string,
  date: string,
  parents: string[],
}

export interface CommitFileChange {
  path: string;
  status: string;
}

export interface CommitDiffState {
  new_content: string;
  old_content: string;
}

export async function getCommits(repoPath?: string): Promise<CommitHistory[] | CommitHistory> {
  return await invoke("get_commits", {
    pageSize: constants.COMMIT_PAGE_SIZE,
    repoPath,
  });
}

export async function getFileDiffByCommit(commitId: string, filePath: string): Promise<CommitDiffState> {
  return await invoke("get_file_diff_by_commit", {
    commitId,
    filePath,
  });
}

export async function getRepoChangesFromCommit(commitId: string, repoPath?: string): Promise<CommitFileChange[]> {
  return await invoke("get_repo_changes_from_commit", {
    commitId,
    repoPath,
  })
}

export async function commitChange(message: string, repoPath?: string): Promise<string> {
  return await invoke("commit", {
    message,
    repo_path: repoPath,
  })
}

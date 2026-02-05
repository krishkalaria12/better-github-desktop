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

export async function getCommits(repoPath?: string): Promise<CommitHistory[] | CommitHistory> {
  return await invoke("get_commits", {
    pageSize: constants.COMMIT_PAGE_SIZE,
    repoPath,
  });
}

import { invoke } from "@tauri-apps/api/core";

enum typeOfBranch {
  "Remote",
  "Local"
}

export interface BranchType {
  name: string,
  type_of: typeOfBranch | "Local" | "Remote",
  is_head: boolean,
}

export async function getBranches(): Promise<BranchType[]> {
  return await invoke("list_branches");
}

export async function createBranch(branchName: string, repoPath?: string) {
  return await invoke("create_branch", {
    repo_path: repoPath,
    branch_name: branchName
  })
}

export async function checkoutBranch(branchName: string, repoPath?: string) {
  return await invoke("checkout_branch", {
    repo_path: repoPath,
    branch_name: branchName
  })
}

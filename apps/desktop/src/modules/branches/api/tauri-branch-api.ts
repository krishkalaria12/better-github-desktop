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

export type MergeAnalysisKind = "up_to_date" | "fast_forward" | "normal_merge";

export interface MergeAnalysisResult {
  analysis: MergeAnalysisKind;
  source_branch: string;
  target_branch: string;
}

export interface FastForwardResult {
  source_branch: string;
  target_branch: string;
  target_oid: string;
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

export async function analyzeMerge(sourceBranch: string, targetBranch: string, repoPath?: string) {
  return await invoke<MergeAnalysisResult>("merge_analysis", {
    repo_path: repoPath,
    source_branch: sourceBranch,
    target_branch: targetBranch,
  });
}

export async function fastForwardBranch(sourceBranch: string, targetBranch: string, repoPath?: string) {
  return await invoke<FastForwardResult>("fast_forward", {
    repo_path: repoPath,
    source_branch: sourceBranch,
    target_branch: targetBranch,
  });
}

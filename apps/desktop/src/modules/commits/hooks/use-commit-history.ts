import { useQuery } from "@tanstack/react-query";
import { getCommits, getFileDiffByCommit, getRepoChangesFromCommit } from "../api/tuari-commit-api";

export function useCommitHistory(repoPath?: string) {
  return useQuery({
    queryKey: ["commit-history", repoPath],
    queryFn: () => getCommits(repoPath),
    enabled: !!repoPath,
  });
}

export function useRepoChangeByCommit(commit_id: string, repo_path?: string) {
  return useQuery({
    queryKey: ["commit-history", repo_path, commit_id],
    queryFn: () => getRepoChangesFromCommit(commit_id, repo_path),
    enabled: !!repo_path && !!commit_id,
  });
}

export function useFileDiffByCommit(commit_id: string, file_path?: string) {
  return useQuery({
    queryKey: ["commit-history", file_path, commit_id],
    queryFn: () => getFileDiffByCommit(commit_id, file_path),
    enabled: !!file_path && !!commit_id,
  });
}

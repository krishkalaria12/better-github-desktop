import { useQuery } from "@tanstack/react-query";
import { getCommits } from "../api/tuari-commit-api";

export function useCommitHistory(repoPath?: string) {
  return useQuery({
    queryKey: ["commit-history", repoPath],
    queryFn: () => getCommits(repoPath),
    enabled: !!repoPath,
  });
}

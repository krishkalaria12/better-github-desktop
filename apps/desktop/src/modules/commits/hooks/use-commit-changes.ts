import { useMutation, useQuery } from "@tanstack/react-query";
import { commitChange, getRepoChangesFromCommit } from "../api/tuari-commit-api";

export function useCommitChanges(commitId?: string, repoPath?: string) {
  return useQuery({
    queryKey: ["commit-changes", commitId, repoPath],
    queryFn: () => getRepoChangesFromCommit(commitId ?? "", repoPath),
    enabled: Boolean(commitId && repoPath),
  });
}

export function useCommit() {
  return useMutation({
    mutationFn: async (message: string) => {
      const response = await commitChange(message);
      return response;
    },
  })
}

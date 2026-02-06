import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commitChange, getRepoChangesFromCommit } from "../api/tuari-commit-api";

export function useCommitChanges(commitId?: string, repoPath?: string) {
  return useQuery({
    queryKey: ["commit-changes", commitId, repoPath],
    queryFn: () => getRepoChangesFromCommit(commitId ?? "", repoPath),
    enabled: Boolean(commitId && repoPath),
  });
}

export function useCommit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { message: string; repoPath?: string }) => {
      const response = await commitChange(payload.message, payload.repoPath);
      return response;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["repo-changes", variables.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["commit-history", variables.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["diff-changes"] }),
      ]);
    },
  });
}

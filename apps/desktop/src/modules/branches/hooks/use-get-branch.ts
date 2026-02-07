import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkoutBranch, createBranch, getBranches } from "../api/tauri-branch-api";

export function useGetBranches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { branchName: string; repoPath?: string }) => {
      return await createBranch(payload.branchName, payload.repoPath);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["branches"] }),
        queryClient.invalidateQueries({ queryKey: ["repo-changes", variables.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["diff-changes"] }),
      ]);
    },
  });
}

export function useCheckoutBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { branchName: string; repoPath?: string }) => {
      return await checkoutBranch(payload.branchName, payload.repoPath);
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["branches"] }),
        queryClient.invalidateQueries({ queryKey: ["repo-changes", variables.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["commit-history", variables.repoPath] }),
        queryClient.invalidateQueries({ queryKey: ["diff-changes"] }),
      ]);
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  analyzeMerge,
  checkoutBranch,
  createBranch,
  fastForwardBranch,
  getBranches,
  normalMergeBranch,
} from "../api/tauri-branch-api";

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

export function useMergeAnalysis() {
  return useMutation({
    mutationFn: async (payload: {
      sourceBranch: string;
      targetBranch: string;
      repoPath?: string;
    }) => {
      return await analyzeMerge(payload.sourceBranch, payload.targetBranch, payload.repoPath);
    },
  });
}

export function useFastForwardMerge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sourceBranch: string;
      targetBranch: string;
      repoPath?: string;
    }) => {
      return await fastForwardBranch(payload.sourceBranch, payload.targetBranch, payload.repoPath);
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

export function useNormalMerge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sourceBranch: string;
      targetBranch: string;
      repoPath?: string;
    }) => {
      return await normalMergeBranch(payload.sourceBranch, payload.targetBranch, payload.repoPath);
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

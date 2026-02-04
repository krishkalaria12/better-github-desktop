import { useQuery } from "@tanstack/react-query";
import { getDiffChanges, getRepoChanges } from "../api/tauri-git-api";

export function useGetRepoChanges() {
  return useQuery({
    queryKey: ["repo-changes"],
    queryFn: getRepoChanges,
  });
}

export function useGetDiffChanges(path?: string) {
  return useQuery({
    queryKey: ["diff-changes", path],
    queryFn: () => getDiffChanges(path ?? ""),
    enabled: Boolean(path),
  });
}

import { useQuery } from "@tanstack/react-query";
import { getRepoChanges } from "../api/tauri-git-api";

export function useGetRepoChanges() {
  return useQuery({
    queryKey: ["repo-changes"],
    queryFn: getRepoChanges,
  });
}

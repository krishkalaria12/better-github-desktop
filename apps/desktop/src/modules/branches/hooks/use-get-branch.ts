import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../api/tauri-branch-api";

export function useGetBranches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: options?.enabled ?? true,
  });
}

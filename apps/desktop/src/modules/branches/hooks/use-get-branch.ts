import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../api/tauri-branch-api";

export function useGetBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })
}

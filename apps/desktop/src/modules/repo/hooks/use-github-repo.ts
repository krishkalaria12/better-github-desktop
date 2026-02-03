import { useAuthStore } from "@/store/github-client";
import { useQuery } from "@tanstack/react-query";
import { getRepos } from "../api/github-repo-api";

export function useGetGithubRepos() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["github-repos"],
    queryFn: async () => {
      return getRepos(token)
    },
    enabled: !!token
  })
}

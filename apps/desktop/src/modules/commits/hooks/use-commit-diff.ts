import { useQuery } from "@tanstack/react-query";
import { getFileDiffByCommit } from "../api/tuari-commit-api";

export function useCommitFileDiff(commitId?: string, filePath?: string) {
  return useQuery({
    queryKey: ["commit-file-diff", commitId, filePath],
    queryFn: () => getFileDiffByCommit(commitId ?? "", filePath ?? ""),
    enabled: Boolean(commitId && filePath),
  });
}

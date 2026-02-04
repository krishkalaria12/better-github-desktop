import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { GithubRepo } from "../api/github-repo-api";

export function RepoListItem({
  repo,
  isSelected,
  onSelect,
}: {
  repo: GithubRepo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border/60 bg-background/70 hover:bg-muted/40"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-9 w-9 border border-border/60">
          <AvatarImage src={repo.owner.avatar_url} alt={repo.owner.login} />
          <AvatarFallback>{repo.owner.login.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{repo.full_name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {repo.description ?? "No description"}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 text-xs text-muted-foreground">
        <Badge variant={repo.private ? "secondary" : "outline"}>
          {repo.private ? "private" : "public"}
        </Badge>
        <Badge variant="outline">{repo.language ?? "Unknown"}</Badge>
      </div>
    </button>
  );
}

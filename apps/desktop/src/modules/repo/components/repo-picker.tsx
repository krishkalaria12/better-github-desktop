import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GithubRepo } from "../api/github-repo-api";
import { RepoListItem } from "./repo-list-item";

export function RepoPicker({
  repos,
  isLoading,
  selectedRepo,
  onSelect,
}: {
  repos: GithubRepo[];
  isLoading: boolean;
  selectedRepo: GithubRepo | null;
  onSelect: (repo: GithubRepo) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredRepos = useMemo(() => {
    if (!query.trim()) {
      return repos;
    }
    const needle = query.toLowerCase();
    return repos.filter((repo) =>
      [repo.name, repo.full_name, repo.description ?? "", repo.owner.login]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query, repos]);

  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / pageSize));
  const paginatedRepos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRepos.slice(start, start + pageSize);
  }, [filteredRepos, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <Card className="flex h-[620px] flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Select a GitHub repository</CardTitle>
            <p className="text-sm text-muted-foreground">Search and pick the repo to clone.</p>
          </div>
          <Badge variant="secondary">{repos.length} total</Badge>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search repo name, owner, or language"
            className="h-10 pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`loading-${index}`} className="h-16 rounded-xl border border-border/60 bg-muted/40" />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex h-[420px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <div className="text-base font-medium text-foreground">No repos found</div>
              <p className="mt-2 max-w-xs">
                Try another search or paste a clone URL on the right to continue.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {paginatedRepos.map((repo) => (
                <RepoListItem
                  key={repo.id}
                  repo={repo}
                  isSelected={selectedRepo?.id === repo.id}
                  onSelect={() => onSelect(repo)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/60 text-xs text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

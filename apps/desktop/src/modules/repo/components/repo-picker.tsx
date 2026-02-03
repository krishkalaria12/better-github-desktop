import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex h-[560px] flex-col border border-black/10 bg-white/60 overflow-hidden">
      <div className="flex min-h-0 flex-col gap-4">
        <div className="flex items-center justify-between px-6 pt-5">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">repos</div>
            <div className="mt-2 text-lg font-semibold text-[#1d1a16]">
              Select a GitHub repository
            </div>
          </div>
          <div className="border border-black/10 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#7a6f62]">
            {repos.length} total
          </div>
        </div>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search repo name, owner, or language"
          className="mx-6 h-10 border-black/10 bg-white/90 px-4 text-sm leading-none"
        />

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 px-6 py-4">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`loading-${index}`} className="h-14 border border-black/5 bg-white/80" />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[#6a6157]">
              <div className="text-base font-medium text-[#2e2a25]">No repos found</div>
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
        </div>

        <div className="flex items-center justify-between border-t border-black/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-[#7a6f62]">
          <span>
            page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="h-8 border-black/10 px-3"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="h-8 border-black/10 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

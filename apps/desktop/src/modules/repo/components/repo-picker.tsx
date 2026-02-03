import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
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

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
              select repo
            </div>
            <div className="mt-2 text-lg font-semibold text-[#1d1a16]">
              Choose from your GitHub list
            </div>
          </div>
          <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#7a6f62]">
            {repos.length} repos
          </div>
        </div>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search repo name, owner, or language"
          className="h-10 rounded-full border-black/10 bg-white/90 px-4 text-sm"
        />

        <div className="h-80 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`loading-${index}`}
                  className="h-16 rounded-2xl border border-black/5 bg-[#f2ede5]"
                />
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
              {filteredRepos.map((repo) => (
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
      </div>
    </div>
  );
}

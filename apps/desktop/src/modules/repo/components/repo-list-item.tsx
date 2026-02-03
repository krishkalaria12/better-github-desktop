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
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
        isSelected
          ? "border-[#0f766e] bg-[#e7f3f0]"
          : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/20"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          className="h-9 w-9 rounded-full border border-black/10"
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#1d1a16]">
            {repo.full_name}
          </div>
          <div className="truncate text-xs text-[#6a6157]">
            {repo.description ?? "No description"}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 text-xs text-[#6a6157]">
        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 uppercase tracking-[0.2em]">
          {repo.private ? "private" : "public"}
        </span>
        <span>{repo.language ?? "Unknown"}</span>
      </div>
    </button>
  );
}

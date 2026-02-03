import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GithubRepo } from "../api/github-repo-api";

export function ClonePanel({
  selectedRepo,
  repoUrl,
  onUrlChange,
  onClone,
  onPickDestination,
  destinationFolder,
  cloneDestination,
  isCloning,
  progressPhase,
  progressValue,
}: {
  selectedRepo: GithubRepo | null;
  repoUrl: string;
  onUrlChange: (value: string) => void;
  onClone: () => void;
  onPickDestination: () => void;
  destinationFolder: string;
  cloneDestination: string;
  isCloning: boolean;
  progressPhase: string;
  progressValue: number;
}) {
  const helperText = selectedRepo
    ? `Cloning ${selectedRepo.full_name}`
    : "Pick a repo on the left or paste a URL.";

  const repoName = selectedRepo?.name ?? repoUrl.trim().split("/").pop()?.replace(/\.git$/, "") ?? "";

  const canClone = !!repoUrl.trim() && !!cloneDestination && !isCloning;

  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">clone repo</div>
          <div className="mt-2 text-lg font-semibold text-[#1d1a16]">Review and confirm</div>
        </div>
        <span className="rounded-full bg-[#fff1de] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#b45309]">
          remote
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4 text-sm text-[#6a6157]">
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#7a6f62]">
          {helperText}
        </div>

        <div className="grid gap-3">
          <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">repo url</div>
          <Input
            value={repoUrl}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://github.com/owner/repo.git"
            className="h-11 rounded-full border-black/10 bg-white px-4 text-sm"
          />
        </div>

        <div className="grid gap-3">
          <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
            destination folder
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={destinationFolder}
              placeholder={repoName ? `Choose a folder for ${repoName}` : "Choose a folder"}
              readOnly
              className="h-11 flex-1 rounded-full border-black/10 bg-white px-4 text-sm"
            />
            <Button
              variant="outline"
              onClick={onPickDestination}
              disabled={isCloning}
              className="h-11 rounded-full border-black/10 px-5"
            >
              Browse
            </Button>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#7a6f62]">
            {cloneDestination
              ? `clone path: ${cloneDestination}`
              : repoName
                ? "choose a destination to see clone path"
                : "select a repo to see clone path"}
          </div>
        </div>

        {isCloning || progressValue > 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[#7a6f62]">
              <span>{progressPhase || "Cloning"}</span>
              <span>{progressValue}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-[#efe7dd]">
              <div
                className="h-2 rounded-full bg-[#0f766e] transition-all"
                style={{ width: `${Math.min(progressValue, 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        <Button
          onClick={onClone}
          disabled={!canClone}
          className="h-11 rounded-full bg-[#1f2937] text-white hover:bg-[#111827]"
        >
          {isCloning ? "Cloning..." : "Clone remote repo"}
        </Button>
      </div>
    </div>
  );
}

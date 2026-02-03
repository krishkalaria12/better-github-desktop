import { type GithubRepo } from "@/modules/repo/api/github-repo-api";
import { useGetGithubRepos } from "@/modules/repo/hooks/use-github-repo";
import { openFolderSelector } from "@/utils/open-folder";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useMemo, useState } from "react";
import { ClonePanel } from "./clone-panel";
import { QuickFlowCard } from "./flow-component";
import { LocalRepoCard } from "./local-repo-card";
import { RepoPicker } from "./repo-picker";
import { StatusSnapshot } from "./status-component";

interface StartWithoutRepoProps {
  openLocal: () => Promise<void>;
  cloneGitRepo: (payload?: {
    repo?: GithubRepo | null;
    url?: string;
    destination?: string;
  }) => Promise<void> | void;
}

export function StartWithoutRepo({ openLocal, cloneGitRepo }: StartWithoutRepoProps) {
  const { isLoading, data: repos } = useGetGithubRepos();
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [progressPhase, setProgressPhase] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  const handleSelectRepo = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setRepoUrl(repo.clone_url);
  };

  const handleClone = async () => {
    setIsCloning(true);
    setProgressValue(0);
    setProgressPhase("Preparing clone");
    try {
      await cloneGitRepo({
        repo: selectedRepo,
        url: repoUrl.trim(),
        destination: cloneDestination,
      });
    } finally {
      setIsCloning(false);
    }
  };

  const handlePickDestination = async () => {
    const folder = await openFolderSelector();
    if (!folder) {
      return;
    }
    if (Array.isArray(folder)) {
      setDestinationFolder(folder[0] ?? "");
      return;
    }
    setDestinationFolder(folder);
  };

  const repoName = useMemo(() => {
    if (selectedRepo?.name) {
      return selectedRepo.name;
    }
    const url = repoUrl.trim();
    if (!url) {
      return "";
    }
    const trimmed = url.replace(/\/$/, "");
    const last = trimmed.split("/").pop() ?? "";
    return last.replace(/\.git$/, "");
  }, [repoUrl, selectedRepo]);

  const cloneDestination = useMemo(() => {
    if (!destinationFolder || !repoName) {
      return "";
    }
    return destinationFolder.replace(/\/$/, "") + "/" + repoName;
  }, [destinationFolder, repoName]);

  useEffect(() => {
    const unlisten = listen<{ value: number; phase: string }>("clone-progress", (event) => {
      setProgressValue(event.payload.value);
      setProgressPhase(event.payload.phase);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f3ea] text-[#1a1814]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(21,128,106,0.18)_0%,rgba(21,128,106,0)_70%)] blur-2xl" />
        <div className="absolute -right-20 top-24 h-85 w-85 rounded-full bg-[radial-gradient(circle,rgba(248,200,120,0.32)_0%,rgba(248,200,120,0)_70%)] blur-2xl" />
        <div className="absolute bottom-16 left-10 h-55 w-55 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.22)_0%,rgba(15,118,110,0)_70%)] blur-2xl animate-float-slow" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-14">
        <div className="w-full rounded-[36px] border border-black/10 bg-white/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 animate-rise-1">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-[#5c5246]">
                <span className="h-2 w-2 rounded-full bg-[#0f766e]" />
                git workspace setup
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-(--font-serif)] leading-tight tracking-tight md:text-5xl">
                  Start from a local repo or clone one from anywhere.
                </h1>
                <p className="max-w-2xl text-base text-[#6b6257]">
                  Select a repository with confidence. Preview the details, confirm your
                  destination, and keep the workflow focused on what matters next.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] animate-rise-2">
              <RepoPicker
                repos={repos ?? []}
                isLoading={isLoading}
                selectedRepo={selectedRepo}
                onSelect={handleSelectRepo}
              />

              <div className="flex flex-col gap-6">
                <ClonePanel
                  selectedRepo={selectedRepo}
                  repoUrl={repoUrl}
                  onUrlChange={setRepoUrl}
                  onClone={handleClone}
                  onPickDestination={handlePickDestination}
                  destinationFolder={destinationFolder}
                  cloneDestination={cloneDestination}
                  isCloning={isCloning}
                  progressPhase={progressPhase}
                  progressValue={progressValue}
                />
                <LocalRepoCard onOpenLocal={openLocal} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] animate-rise-3">
              <QuickFlowCard />
              <StatusSnapshot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

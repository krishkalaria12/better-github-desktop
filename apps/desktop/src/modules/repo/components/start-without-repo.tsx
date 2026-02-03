import { type GithubRepo } from "@/modules/repo/api/github-repo-api";
import { useGetGithubRepos } from "@/modules/repo/hooks/use-github-repo";
import { openFolderSelector } from "@/utils/open-folder";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useMemo, useState } from "react";
import { ClonePanel } from "./clone-panel";
import { LocalRepoCard } from "./local-repo-card";
import { RepoPicker } from "./repo-picker";

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
  const [mode, setMode] = useState<"clone" | "local">("clone");
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
      setProgressValue(100);
      setProgressPhase("Downloaded");
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
    const normalizedFolder = destinationFolder.replace(/[\\/]+$/, "");
    const lastSegment = normalizedFolder.split(/[\\/]/).filter(Boolean).pop() ?? "";
    if (lastSegment === repoName) {
      return normalizedFolder;
    }
    return normalizedFolder + "/" + repoName;
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
    <div className="min-h-screen bg-[#f6f1e8] text-[#1a1814]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-10 py-10">
        <div className="flex items-center justify-between border-b border-black/10 pb-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-[#5c5246]">
              git workspace setup
            </div>
            <div className="mt-3 text-3xl font-(--font-serif) tracking-tight">
              Connect a repository
            </div>
            <p className="mt-2 max-w-2xl text-sm text-[#6b6257]">
              Pick a repo, confirm the destination folder, and stay focused in a desktop-first
              layout.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex border border-black/15 bg-white/70">
              <button
                type="button"
                onClick={() => setMode("clone")}
                className={`px-4 py-2 text-xs uppercase tracking-[0.24em] transition ${
                  mode === "clone"
                    ? "bg-[#1f2937] text-white"
                    : "text-[#6b6257] hover:text-[#1f2937]"
                }`}
              >
                clone repo
              </button>
              <button
                type="button"
                onClick={() => setMode("local")}
                className={`px-4 py-2 text-xs uppercase tracking-[0.24em] transition ${
                  mode === "local"
                    ? "bg-[#0f766e] text-white"
                    : "text-[#6b6257] hover:text-[#1f2937]"
                }`}
              >
                open local
              </button>
            </div>
          </div>
        </div>

        {mode === "clone" ? (
          <div className="mt-8 grid flex-1 grid-cols-[minmax(0,1fr)_380px] gap-8">
            <RepoPicker
              repos={repos ?? []}
              isLoading={isLoading}
              selectedRepo={selectedRepo}
              onSelect={handleSelectRepo}
            />
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
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-[minmax(0,1fr)_380px] items-start gap-8">
            <div className="border border-black/10 bg-white/60 px-8 py-8">
              <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
                local workspace
              </div>
              <div className="mt-3 text-2xl font-semibold text-[#1d1a16]">
                Open a repository already on this machine.
              </div>
              <p className="mt-4 max-w-xl text-sm text-[#6a6157]">
                Choose a folder, validate that it is a Git repository, and jump straight into
                your workspace with the latest context.
              </p>
              <div className="mt-6">
                <LocalRepoCard onOpenLocal={openLocal} />
              </div>
            </div>
            <div className="border border-black/10 bg-white/60 px-6 py-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
                tips
              </div>
              <ul className="mt-4 space-y-3 text-sm text-[#3b352d]">
                <li>Keep clones in a dedicated workspace folder.</li>
                <li>Use short repo names for quicker navigation.</li>
                <li>Switch back to Clone to pull from GitHub.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

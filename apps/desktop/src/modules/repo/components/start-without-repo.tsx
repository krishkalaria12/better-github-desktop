import { type GithubRepo } from "@/modules/repo/api/github-repo-api";
import { useGetGithubRepos } from "@/modules/repo/hooks/use-github-repo";
import { openFolderSelector } from "@/utils/open-folder";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClonePanel } from "./clone-panel";
import { LocalRepoCard } from "./local-repo-card";
import { QuickFlowCard } from "./flow-component";
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
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-6">
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.28em]">
            git workspace setup
          </Badge>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-foreground">Connect a repository</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Pick a GitHub repo or open a local folder, confirm the destination, and jump into a
              focused desktop workspace.
            </p>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as "clone" | "local")} className="mt-8">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="clone">Clone repo</TabsTrigger>
            <TabsTrigger value="local">Open local</TabsTrigger>
          </TabsList>

          <TabsContent value="clone" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
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
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <StatusSnapshot />
              <QuickFlowCard />
            </div>
          </TabsContent>

          <TabsContent value="local" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">Open a repository already on this machine</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a folder, validate the Git repository, and pick up exactly where you
                    left off.
                  </p>
                </div>
                <LocalRepoCard onOpenLocal={openLocal} />
              </div>
              <QuickFlowCard />
            </div>
            <div className="mt-6">
              <StatusSnapshot />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { ArrowUpToLine, CheckCircle2, Cloud, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useFetchRepo, usePushRepo } from "@/modules/repo/hooks/use-tauri-repo";

interface PushProgressPayload {
  phase: string;
  value: number;
}

interface RemoteSyncMenuProps {
  repoPath: string | null;
  token: string | null;
  currentBranch: string;
  isRepoSelected: boolean;
}

export function RemoteSyncMenu({ repoPath, token, currentBranch, isRepoSelected }: RemoteSyncMenuProps) {
  const [open, setOpen] = useState(false);
  const [pushAfterFetch, setPushAfterFetch] = useState(true);
  const [pushProgress, setPushProgress] = useState(0);
  const [pushPhase, setPushPhase] = useState("");

  const fetchRepoMutation = useFetchRepo();
  const pushRepoMutation = usePushRepo();

  const isFetching = fetchRepoMutation.isPending;
  const isPushing = pushRepoMutation.isPending;

  useEffect(() => {
    const unlisten = listen<PushProgressPayload>("push-progress", (event) => {
      setPushProgress(event.payload.value);
      setPushPhase(event.payload.phase);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const resolveErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return fallback;
  };

  const handleFetch = async () => {
    if (!repoPath) {
      return;
    }

    try {
      await fetchRepoMutation.mutateAsync({ repoPath, token });
      toast.success("Fetched latest origin refs");
    } catch (error) {
      toast.error(resolveErrorMessage(error, "Failed to fetch from origin"));
    }
  };

  const handlePush = async () => {
    if (!repoPath) {
      return;
    }

    setPushProgress(0);
    setPushPhase(pushAfterFetch ? "Fetching before push" : "Preparing push");

    try {
      if (pushAfterFetch) {
        await fetchRepoMutation.mutateAsync({ repoPath, token });
      }

      const result = await pushRepoMutation.mutateAsync({ repoPath, token });
      const upstreamLabel = result.set_upstream ? " and set upstream" : "";
      toast.success(`Pushed ${result.branch_name} to ${result.remote_name}${upstreamLabel}`);
    } catch (error) {
      toast.error(resolveErrorMessage(error, "Push failed"));
    }
  };

  const isBusy = isFetching || isPushing;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="secondary" size="sm" className="h-8 gap-2" disabled={!isRepoSelected}>
            <Cloud className="h-3.5 w-3.5" />
            Sync remote
          </Button>
        }
      />

      <DropdownMenuContent align="end" sideOffset={8} className="w-[380px] rounded-md p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">remote sync</p>
          <p className="mt-1 text-sm font-semibold text-foreground">Fetch and push safely</p>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <p className="uppercase tracking-[0.18em] text-muted-foreground">remote</p>
              <p className="mt-1 font-medium text-foreground">origin</p>
            </div>
            <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
              <p className="uppercase tracking-[0.18em] text-muted-foreground">branch</p>
              <p className="mt-1 truncate font-medium text-foreground">{currentBranch}</p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <span>Fetch before push</span>
            <Checkbox checked={pushAfterFetch} onCheckedChange={(value) => setPushAfterFetch(value === true)} />
          </label>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-9 flex-1" disabled={isBusy} onClick={handleFetch}>
              {isFetching ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
              Fetch
            </Button>

            <Button type="button" className="h-9 flex-1" disabled={isBusy} onClick={handlePush}>
              {isPushing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ArrowUpToLine className="mr-2 h-3.5 w-3.5" />}
              Push
            </Button>
          </div>
        </div>

        {isPushing || pushProgress > 0 ? (
          <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>{pushPhase || "Pushing"}</span>
              <span>{pushProgress}%</span>
            </div>
            <Progress value={Math.min(pushProgress, 100)} className="h-2" />
          </div>
        ) : null}

        <div className="border-t border-border/60 px-4 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>First push auto-links upstream to origin/{currentBranch}</span>
            <Badge variant="outline" className="ml-auto h-5 px-1.5 text-[10px]">
              safe mode
            </Badge>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

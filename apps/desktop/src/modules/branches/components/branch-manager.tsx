import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BranchType, MergeAnalysisResult } from "@/modules/branches/api/tauri-branch-api";
import {
  useCheckoutBranch,
  useCreateBranch,
  useGetBranches,
  useMergeAnalysis,
} from "@/modules/branches/hooks/use-get-branch";
import { Check, GitBranch, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface BranchManagerProps {
  repoPath: string | null;
  currentBranch: string;
  isRepoSelected: boolean;
}

const normalizeBranchType = (typeOf: BranchType["type_of"]) => {
  if (typeof typeOf === "string") {
    return typeOf.toLowerCase();
  }
  return typeOf === 0 ? "remote" : "local";
};

const isLocalBranch = (typeOf: BranchType["type_of"]) => {
  const normalized = normalizeBranchType(typeOf);
  return normalized === "local";
};

export function BranchManager({ repoPath, currentBranch, isRepoSelected }: BranchManagerProps) {
  const [open, setOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [search, setSearch] = useState("");
  const [checkoutAfterCreate, setCheckoutAfterCreate] = useState(true);
  const [mergeSourceBranch, setMergeSourceBranch] = useState("");
  const [mergeAnalysis, setMergeAnalysis] = useState<MergeAnalysisResult | null>(null);

  const { data, isLoading } = useGetBranches({ enabled: isRepoSelected });
  const createBranchMutation = useCreateBranch();
  const checkoutBranchMutation = useCheckoutBranch();
  const mergeAnalysisMutation = useMergeAnalysis();

  const branches = useMemo(() => {
    const raw = data as BranchType[] | BranchType | undefined;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const sorted = [...list].sort((a, b) => {
      if (a.is_head && !b.is_head) return -1;
      if (!a.is_head && b.is_head) return 1;
      if (isLocalBranch(a.type_of) && !isLocalBranch(b.type_of)) return -1;
      if (!isLocalBranch(a.type_of) && isLocalBranch(b.type_of)) return 1;
      return a.name.localeCompare(b.name);
    });
    if (!search.trim()) {
      return sorted;
    }
    const needle = search.toLowerCase();
    return sorted.filter((branch) => branch.name.toLowerCase().includes(needle));
  }, [data, search]);

  const isMutating = createBranchMutation.isPending || checkoutBranchMutation.isPending;
  const localMergeCandidates = branches.filter(
    (branch) => isLocalBranch(branch.type_of) && !branch.is_head
  );

  useEffect(() => {
    if (!localMergeCandidates.length) {
      setMergeSourceBranch("");
      return;
    }

    const branchStillExists = localMergeCandidates.some((branch) => branch.name === mergeSourceBranch);
    if (!branchStillExists) {
      setMergeSourceBranch(localMergeCandidates[0]?.name ?? "");
    }
  }, [localMergeCandidates, mergeSourceBranch]);

  const handleCheckout = (branchName: string) => {
    if (!repoPath || branchName === currentBranch) {
      return;
    }

    checkoutBranchMutation.mutate(
      { branchName, repoPath },
      {
        onSuccess: () => {
          toast.success(`Switched to ${branchName}`);
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Unable to switch branch";
          toast.error(message);
        },
      }
    );
  };

  const handleCreateBranch = () => {
    const candidate = newBranchName.trim();
    if (!repoPath || !candidate) {
      return;
    }

    createBranchMutation.mutate(
      { branchName: candidate, repoPath },
      {
        onSuccess: () => {
          toast.success(`Created branch ${candidate}`);
          setNewBranchName("");
          if (checkoutAfterCreate) {
            handleCheckout(candidate);
          }
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Unable to create branch";
          toast.error(message);
        },
      }
    );
  };

  const handleMergeAnalysis = () => {
    if (!repoPath || !mergeSourceBranch) {
      return;
    }

    mergeAnalysisMutation.mutate(
      {
        sourceBranch: mergeSourceBranch,
        targetBranch: currentBranch,
        repoPath,
      },
      {
        onSuccess: (result) => {
          setMergeAnalysis(result);
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Unable to analyze merge";
          toast.error(message);
        },
      }
    );
  };

  const analysisLabel =
    mergeAnalysis?.analysis === "fast_forward"
      ? "Fast-forward"
      : mergeAnalysis?.analysis === "normal_merge"
        ? "Merge commit"
        : mergeAnalysis?.analysis === "up_to_date"
          ? "Up-to-date"
          : "Not analyzed";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="secondary" size="sm" className="h-8 gap-2">
            <GitBranch className="h-3.5 w-3.5" />
            <span className="max-w-[130px] truncate">{isRepoSelected ? currentBranch : "no branch"}</span>
          </Button>
        }
        disabled={!isRepoSelected}
      />

      <DropdownMenuContent align="end" sideOffset={8} className="w-[360px] rounded-md p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">branch actions</p>
          <p className="mt-1 text-sm font-semibold text-foreground">Create and switch branches</p>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div className="flex gap-2">
            <Input
              value={newBranchName}
              onChange={(event) => setNewBranchName(event.target.value)}
              placeholder="feature/improve-diff-view"
              className="h-8"
            />
            <Button
              type="button"
              size="sm"
              className="h-8 px-3"
              onClick={handleCreateBranch}
              disabled={isMutating || !newBranchName.trim()}
            >
              {createBranchMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={checkoutAfterCreate}
              onCheckedChange={(value) => setCheckoutAfterCreate(value === true)}
            />
            Checkout after create
          </label>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">merge analysis</p>
            <div className="mt-2 flex gap-2">
              <select
                value={mergeSourceBranch}
                onChange={(event) => setMergeSourceBranch(event.target.value)}
                disabled={!localMergeCandidates.length || mergeAnalysisMutation.isPending}
                className="h-8 flex-1 rounded-none border border-input bg-transparent px-2 text-xs"
              >
                {localMergeCandidates.map((branch) => (
                  <option key={branch.name} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3"
                onClick={handleMergeAnalysis}
                disabled={!mergeSourceBranch || mergeAnalysisMutation.isPending}
              >
                {mergeAnalysisMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">into {currentBranch}</p>
              <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-[0.18em]">
                {analysisLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search branches"
              className="h-8 pl-7"
            />
          </div>
        </div>

        <ScrollArea className="h-[280px] px-3 pb-3">
          <div className="space-y-2 pt-1">
            {isLoading ? (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">Loading branches...</div>
            ) : branches.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-5 text-center text-sm text-muted-foreground">
                No matching branches.
              </div>
            ) : (
              branches.map((branch) => {
                const normalizedType = normalizeBranchType(branch.type_of);
                const isHead = branch.is_head;
                return (
                  <button
                    key={`${branch.name}-${normalizedType}`}
                    type="button"
                    onClick={() => handleCheckout(branch.name)}
                    disabled={isMutating || isHead || !isLocalBranch(branch.type_of)}
                    className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition ${
                      isHead
                        ? "border-border/70 bg-muted/50"
                        : "border-border/50 bg-background/70 hover:bg-muted/40"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{branch.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {isLocalBranch(branch.type_of)
                          ? isHead
                            ? "current branch"
                            : "switch branch"
                          : "remote branch"}
                      </p>
                    </div>

                    <div className="ml-2 flex items-center gap-1.5">
                      {isHead ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase tracking-[0.2em]">
                        {normalizedType}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

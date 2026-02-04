import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

  const repoName =
    selectedRepo?.name ?? repoUrl.trim().split("/").pop()?.replace(/\.git$/, "") ?? "";

  const canClone = !!repoUrl.trim() && !!cloneDestination && !isCloning;

  return (
    <Card className="flex h-[620px] flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Destination + progress</CardTitle>
            <p className="text-sm text-muted-foreground">Review the clone details before you sync.</p>
          </div>
          <Badge variant="outline">remote</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-5 text-sm">
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {helperText}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="repo-url" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            repo url
          </Label>
          <Input
            id="repo-url"
            value={repoUrl}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://github.com/owner/repo.git"
            className="h-11"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="destination-folder" className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            destination folder
          </Label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="destination-folder"
              value={destinationFolder}
              placeholder={repoName ? `Choose a folder for ${repoName}` : "Choose a folder"}
              readOnly
              className="h-11 flex-1"
            />
            <Button variant="outline" onClick={onPickDestination} disabled={isCloning} className="h-11">
              Browse
            </Button>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            {cloneDestination
              ? `clone path: ${cloneDestination}`
              : repoName
                ? "choose a destination to see clone path"
                : "select a repo to see clone path"}
          </div>
        </div>

        {isCloning || progressValue > 0 ? (
          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>{progressPhase || "Cloning"}</span>
              <span>{progressValue}%</span>
            </div>
            <Progress className="mt-3 h-2" value={Math.min(progressValue, 100)} />
          </div>
        ) : null}

        <div className="mt-auto">
          <Button onClick={onClone} disabled={!canClone} className="h-11 w-full">
            {isCloning ? "Cloning..." : "Clone remote repo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

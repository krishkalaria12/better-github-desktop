import { Badge } from "@/components/ui/badge";

interface SidebarHeaderProps {
  repoLabel: string;
  repoPath: string;
}

export function SidebarHeader({ repoLabel, repoPath }: SidebarHeaderProps) {
  return (
    <div className="border-b border-border/60 pb-6">
      <Badge variant="outline" className="text-[10px] uppercase tracking-[0.24em]">
        repository
      </Badge>
      <div className="mt-3 text-xl font-semibold text-foreground">{repoLabel}</div>
      <div className="mt-2 text-xs text-muted-foreground">{repoPath}</div>
    </div>
  );
}

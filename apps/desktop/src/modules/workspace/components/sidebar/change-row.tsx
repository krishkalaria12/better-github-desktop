import { Badge } from "@/components/ui/badge";
import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { FileStatus } from "@/modules/workspace/api/tauri-git-api";

interface ChangeRowProps {
  change: FileChange;
  isSelected: boolean;
  onSelect: (path: string) => void;
}

const normalizeStatus = (status: FileChange["status"]) => {
  if (typeof status === "number") {
    return FileStatus[status] ?? "Modified";
  }
  return status;
};

const statusStyles: Record<string, { label: string; className: string }> = {
  New: { label: "new", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" },
  Modified: { label: "modified", className: "border-amber-500/30 bg-amber-500/10 text-amber-600" },
  Deleted: { label: "deleted", className: "border-rose-500/30 bg-rose-500/10 text-rose-600" },
};

export function ChangeRow({ change, isSelected, onSelect }: ChangeRowProps) {
  const normalizedStatus = normalizeStatus(change.status);
  const status = statusStyles[normalizedStatus] ?? statusStyles.Modified;
  const containerClasses = isSelected
    ? "border-primary/40 bg-primary/5"
    : "border-border/60 bg-background/70 hover:bg-muted/40";

  return (
    <button
      type="button"
      onClick={() => onSelect(change.path)}
      className={`flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${containerClasses}`}
    >
      <div className="min-w-0 flex-1">
        <div className="break-words text-sm font-medium text-foreground">{change.path}</div>
        <div className="mt-1 text-xs text-muted-foreground">tracked change</div>
      </div>
      <Badge className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.2em] ${status.className}`}>
        {status.label}
      </Badge>
    </button>
  );
}

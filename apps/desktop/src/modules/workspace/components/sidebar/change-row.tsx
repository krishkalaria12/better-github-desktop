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

const statusStyles: Record<string, { label: string; short: string; className: string }> = {
  New: { label: "new", short: "A", className: "border-emerald-500/40 text-emerald-500" },
  Modified: { label: "modified", short: "M", className: "border-amber-500/40 text-amber-500" },
  Deleted: { label: "deleted", short: "D", className: "border-rose-500/40 text-rose-500" },
};

export function ChangeRow({ change, isSelected, onSelect }: ChangeRowProps) {
  const normalizedStatus = normalizeStatus(change.status);
  const status = statusStyles[normalizedStatus] ?? statusStyles.Modified;
  const containerClasses = isSelected
    ? "border-border/70 bg-muted/60"
    : "border-transparent hover:border-border/50 hover:bg-muted/30";

  return (
    <button
      type="button"
      onClick={() => onSelect(change.path)}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition ${containerClasses}`}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{change.path}</div>
      </div>
      <span
        className={`flex h-5 w-6 items-center justify-center rounded border text-[10px] font-semibold uppercase ${status.className}`}
        aria-label={status.label}
      >
        {status.short}
      </span>
    </button>
  );
}

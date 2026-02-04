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
  New: { label: "new", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" },
  Modified: { label: "modified", className: "border-amber-500/30 bg-amber-500/10 text-amber-700" },
  Deleted: { label: "deleted", className: "border-rose-500/30 bg-rose-500/10 text-rose-700" },
};

export function ChangeRow({ change, isSelected, onSelect }: ChangeRowProps) {
  const normalizedStatus = normalizeStatus(change.status);
  const status = statusStyles[normalizedStatus] ?? statusStyles.Modified;
  const containerClasses = isSelected
    ? "border-[#1f2937] bg-[#f3ede3]"
    : "border-black/10 bg-white/90 hover:bg-[#f7f2ea]";

  return (
    <button
      type="button"
      onClick={() => onSelect(change.path)}
      className={`flex w-full items-start justify-between gap-3 border px-3 py-3 text-left transition ${containerClasses}`}
    >
      <div className="min-w-0 flex-1">
        <div className="break-words text-sm font-medium text-[#1d1a16]">
          {change.path}
        </div>
        <div className="mt-1 text-xs text-[#6a6157]">tracked change</div>
      </div>
      <span
        className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.2em] ${
          status.className
        }`}
      >
        {status.label}
      </span>
    </button>
  );
}

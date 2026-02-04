import type { FileChange } from "@/modules/workspace/api/tauri-git-api";
import { FileStatus } from "@/modules/workspace/api/tauri-git-api";

interface BranchSummaryProps {
  branchName: string;
  changes: FileChange[];
}

const statusLabels = {
  New: "new",
  Modified: "modified",
  Deleted: "deleted",
} as const;

type StatusLabel = (typeof statusLabels)[keyof typeof statusLabels];

const normalizeStatus = (status: FileChange["status"]) => {
  if (typeof status === "number") {
    return FileStatus[status] ?? "Modified";
  }
  return status;
};

export function BranchSummary({ branchName, changes }: BranchSummaryProps) {
  const counts = changes.reduce<Record<StatusLabel, number>>(
    (acc, change) => {
      const key = normalizeStatus(change.status);
      const label = statusLabels[key as keyof typeof statusLabels] ?? "modified";
      acc[label] += 1;
      return acc;
    },
    { new: 0, modified: 0, deleted: 0 }
  );

  return (
    <div className="rounded-none border border-black/10 bg-[#f7f2ea] px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.3em] text-[#7a6f62]">
        current branch
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="text-lg font-semibold text-[#1d1a16]">{branchName}</div>
        <div className="ml-auto rounded-full border border-black/10 px-3 py-1 text-[11px] uppercase text-[#6b6257]">
          {changes.length} changes
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#6b6257]">
        <div className="min-w-22 flex-1 rounded-none border border-black/10 bg-white/70 px-2 py-2 text-center">
          {counts.new} new
        </div>
        <div className="min-w-22 flex-1 rounded-none border border-black/10 bg-white/70 px-2 py-2 text-center">
          {counts.modified} modified
        </div>
        <div className="min-w-22 flex-1 rounded-none border border-black/10 bg-white/70 px-2 py-2 text-center">
          {counts.deleted} deleted
        </div>
      </div>
    </div>
  );
}

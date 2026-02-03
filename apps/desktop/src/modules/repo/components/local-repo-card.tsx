import { Button } from "@/components/ui/button";

export function LocalRepoCard({ onOpenLocal }: { onOpenLocal: () => Promise<void> }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">open local</div>
          <div className="mt-2 text-lg font-semibold text-[#1d1a16]">Add a local repo</div>
        </div>
        <span className="rounded-full bg-[#e7f3f0] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#0f766e]">
          local
        </span>
      </div>
      <p className="mt-4 text-sm text-[#6a6157]">
        Browse for a folder on this machine and connect it instantly to your workspace.
      </p>
      <Button
        onClick={onOpenLocal}
        className="mt-6 h-11 w-full rounded-full bg-[#0f766e] text-white hover:bg-[#0b5f59]"
      >
        Add local repo
      </Button>
    </div>
  );
}

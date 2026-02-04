interface WorkspaceMainProps {
  repoLabel: string;
  repoPath: string;
}

export function WorkspaceMain({ repoLabel, repoPath }: WorkspaceMainProps) {
  return (
    <main className="flex min-h-screen min-w-0 flex-1 flex-col px-10 py-10">
      <div className="flex items-center justify-between border-b border-black/10 pb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-[#5c5246]">
            workspace overview
          </div>
          <div className="mt-3 text-3xl font-(--font-serif) tracking-tight">
            {repoLabel}
          </div>
          <div className="mt-2 max-w-2xl text-sm text-[#6b6257]">
            {repoPath}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#6b6257]">
          <span className="rounded-full border border-black/10 px-3 py-1">local</span>
          <span className="rounded-full border border-black/10 px-3 py-1">tauri</span>
        </div>
      </div>

      <div className="mt-10 grid flex-1 grid-cols-[minmax(0,1fr)_320px] gap-8">
        <section className="flex h-full flex-col justify-between border border-black/10 bg-white/70 px-8 py-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
              activity hub
            </div>
            <div className="mt-4 text-2xl font-semibold text-[#1d1a16]">
              Changes will appear alongside your commits.
            </div>
            <p className="mt-4 max-w-xl text-sm text-[#6a6157]">
              Keep this space ready for diffs, commit previews, and history once you wire the
              interactions. The layout already matches the backend responses.
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-sm text-[#4b4237]">
            <div className="border border-black/10 bg-[#f7f2ea] px-4 py-4">
              Highlighted file content and diff previews.
            </div>
            <div className="border border-black/10 bg-[#f7f2ea] px-4 py-4">
              Commit metadata and branch insights.
            </div>
          </div>
        </section>

        <aside className="border border-black/10 bg-white/70 px-6 py-6">
          <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
            backend status
          </div>
          <div className="mt-4 space-y-4 text-sm text-[#3b352d]">
            <div className="flex items-start justify-between">
              <span className="font-medium">Repo validation</span>
              <span className="rounded-full border border-black/10 px-2 py-1 text-[11px] uppercase">
                ready
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="font-medium">Git changes hook</span>
              <span className="rounded-full border border-black/10 px-2 py-1 text-[11px] uppercase">
                wired
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="font-medium">UI wiring</span>
              <span className="rounded-full border border-black/10 px-2 py-1 text-[11px] uppercase">
                pending
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

import { Button } from "@/components/ui/button";

interface StartWithoutRepoProps {
  openfolder: () => Promise<void>;
}

export function StartWithoutRepo({ openfolder }: StartWithoutRepoProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f3ea] text-[#1a1814]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(21,128,106,0.18)_0%,rgba(21,128,106,0)_70%)] blur-2xl" />
        <div className="absolute -right-20 top-24 h-85 w-85 rounded-full bg-[radial-gradient(circle,rgba(248,200,120,0.32)_0%,rgba(248,200,120,0)_70%)] blur-2xl" />
        <div className="absolute bottom-16 left-10 h-55 w-55 rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.22)_0%,rgba(15,118,110,0)_70%)] blur-2xl animate-float-slow" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-14">
        <div className="w-full rounded-[36px] border border-black/10 bg-white/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6 animate-rise-1">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-[#5c5246]">
                <span className="h-2 w-2 rounded-full bg-[#0f766e]" />
                git workspace setup
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-(--font-serif) leading-tight tracking-tight md:text-5xl">
                  Start from a local repo or clone one from anywhere.
                </h1>
                <p className="max-w-2xl text-base text-[#6b6257]">
                  Connect a repository in a way that feels natural. Keep everything organized
                  with a focused dashboard designed for fast context switching.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 animate-rise-2">
              <div className="group rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold uppercase tracking-wide text-[#1d1a16]">
                    add local repo
                  </div>
                  <span className="rounded-full bg-[#e7f3f0] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#0f766e]">
                    local
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#6a6157]">
                  Choose a folder on this machine and keep the working tree synced with your
                  workspace.
                </p>
                <Button onClick={openfolder} className="mt-6 h-10 w-full rounded-full bg-[#0f766e] text-white hover:bg-[#0b5f59]">
                  Add local repo
                </Button>
              </div>

              <div className="group rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold uppercase tracking-wide text-[#1d1a16]">
                    clone remote repo
                  </div>
                  <span className="rounded-full bg-[#fff1de] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#b45309]">
                    remote
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#6a6157]">
                  Paste a Git URL and spin up a clean clone with your preferred defaults.
                </p>
                <Button className="mt-6 h-10 w-full rounded-full bg-[#1f2937] text-white hover:bg-[#111827]">
                  Clone remote repo
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] animate-rise-3">
              <div className="rounded-3xl border border-black/10 bg-[#f7f0e5] p-6">
                <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
                  quick flow
                </div>
                <div className="mt-4 grid gap-4 text-sm text-[#3b352d]">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0f766e]">
                      01
                    </div>
                    <div>
                      Pick a repo source and name your workspace so it stays searchable later.
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0f766e]">
                      02
                    </div>
                    <div>
                      Sync branches, review status, and capture context before you start.
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0f766e]">
                      03
                    </div>
                    <div>
                      Track active changes and return instantly to your last working state.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 rounded-3xl border border-black/10 bg-white/80 p-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">
                    status snapshot
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                      <span className="text-[#2e2a25]">clean working tree</span>
                      <span className="text-[#0f766e]">ready</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                      <span className="text-[#2e2a25]">last sync</span>
                      <span className="text-[#6b6257]">just now</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                      <span className="text-[#2e2a25]">remote access</span>
                      <span className="text-[#6b6257]">enabled</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-[#7a6f62]">
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1">secure auth</span>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1">fast sync</span>
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1">offline ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

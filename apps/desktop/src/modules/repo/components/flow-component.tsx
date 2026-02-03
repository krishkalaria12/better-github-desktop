export function QuickFlowCard() {
  return (
    <div className="rounded-3xl border border-black/10 bg-[#f7f0e5] p-6">
      <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">quick flow</div>
      <div className="mt-4 grid gap-4 text-sm text-[#3b352d]">
        <FlowStep index="01">
          Pick a repo source and name your workspace so it stays searchable later.
        </FlowStep>
        <FlowStep index="02">Confirm clone path and sync before you start.</FlowStep>
        <FlowStep index="03">Jump back into your last working state instantly.</FlowStep>
      </div>
    </div>
  );
}

export function FlowStep({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0f766e]">
        {index}
      </div>
      <div>{children}</div>
    </div>
  );
}

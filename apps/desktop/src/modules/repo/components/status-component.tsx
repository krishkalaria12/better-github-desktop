export function StatusSnapshot() {
  return (
    <div className="flex flex-col justify-between gap-6 border border-black/10 bg-white/60 px-6 py-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-[#7a6f62]">status snapshot</div>
        <div className="mt-4 grid gap-3">
          <StatusRow label="auth status" value="verified" accent />
          <StatusRow label="clone path" value="ready" accent={false} />
          <StatusRow label="sync mode" value="optimized" accent={false} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-[#7a6f62]">
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">secure auth</span>
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">fast sync</span>
        <span className="rounded-full border border-black/10 bg-white px-3 py-1">offline ready</span>
      </div>
    </div>
  );
}

export function StatusRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
      <span className="text-[#2e2a25]">{label}</span>
      <span className={accent ? "text-[#0f766e]" : "text-[#6b6257]"}>{value}</span>
    </div>
  );
}

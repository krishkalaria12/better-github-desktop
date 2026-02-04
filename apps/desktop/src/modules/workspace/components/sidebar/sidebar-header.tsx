interface SidebarHeaderProps {
  repoLabel: string;
  repoPath: string;
}

export function SidebarHeader({ repoLabel, repoPath }: SidebarHeaderProps) {
  return (
    <div className="border-b border-black/10 pb-6">
      <div className="text-[11px] uppercase tracking-[0.4em] text-[#6b6257]">
        repository
      </div>
      <div className="mt-3 text-2xl font-(--font-serif) tracking-tight text-[#1d1a16]">
        {repoLabel}
      </div>
      <div className="mt-2 text-xs text-[#6a6157]">
        {repoPath}
      </div>
    </div>
  );
}

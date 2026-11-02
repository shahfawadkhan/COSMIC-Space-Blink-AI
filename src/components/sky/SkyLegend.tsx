import React from 'react';

export const SkyLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono text-[var(--cosmic-text-muted)] bg-[var(--cosmic-surface)]/95 backdrop-blur px-3 py-1.5 rounded-lg border border-[var(--cosmic-border)] shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full border border-amber-500 bg-amber-500/30" />
        <span>Requires Review</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full border border-[var(--cosmic-cyan)] bg-[var(--cosmic-cyan)]/30" />
        <span>Under Investigation</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full border border-emerald-500 bg-emerald-500/30" />
        <span>Known Object Match</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full border border-rose-500 bg-rose-500/30" />
        <span>Possible Artifact</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[var(--cosmic-text-subtle)]" />
        <span>Normal Source</span>
      </div>
    </div>
  );
};

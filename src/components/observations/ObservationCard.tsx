import React from 'react';
import { ObservationMetadata } from '../../types/observation';

interface ObservationCardProps {
  observation: ObservationMetadata;
  isActive?: boolean;
  onSelect?: () => void;
}

export const ObservationCard: React.FC<ObservationCardProps> = ({
  observation,
  isActive = false,
  onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all ${
        isActive
          ? 'bg-[var(--cosmic-surface-hover)] border-[var(--cosmic-cyan)] shadow-sm'
          : 'bg-[var(--cosmic-surface)] border-[var(--cosmic-border)] hover:border-[var(--cosmic-border-strong)] hover:bg-[var(--cosmic-surface-hover)]'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30 font-medium">
            {observation.epoch}
          </span>
          <h4 className="text-sm font-bold font-mono text-[var(--cosmic-text)] mt-1.5">
            {observation.id}
          </h4>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          QA {observation.qualityScore.toFixed(1)}%
        </span>
      </div>

      <p className="text-xs text-[var(--cosmic-text)] font-medium mb-3">
        {observation.targetRegion}
      </p>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--cosmic-text-muted)] border-t border-[var(--cosmic-border)] pt-2.5">
        <div>
          <span className="text-[var(--cosmic-text-subtle)]">Band:</span>
          <div className="text-[var(--cosmic-text)] truncate">{observation.filterBand}</div>
        </div>
        <div>
          <span className="text-[var(--cosmic-text-subtle)]">Exp Time:</span>
          <div className="text-[var(--cosmic-text)]">{observation.exposureSec}s</div>
        </div>
        <div>
          <span className="text-[var(--cosmic-text-subtle)]">Center:</span>
          <div className="text-[var(--cosmic-text)]">{observation.centerRa.toFixed(2)}°, {observation.centerDec.toFixed(2)}°</div>
        </div>
        <div>
          <span className="text-[var(--cosmic-text-subtle)]">Candidates:</span>
          <div className="text-[var(--cosmic-cyan)] font-semibold">{observation.candidatesDetected} flagged</div>
        </div>
      </div>
    </div>
  );
};

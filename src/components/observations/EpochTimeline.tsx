import React from 'react';
import { ObservationEpoch, EpochId } from '../../types/observation';
import { Clock, Calendar } from 'lucide-react';

interface EpochTimelineProps {
  epochs: ObservationEpoch[];
  selectedEpoch: EpochId;
  onSelectEpoch: (epochId: EpochId) => void;
  className?: string;
}

export const EpochTimeline: React.FC<EpochTimelineProps> = ({
  epochs,
  selectedEpoch,
  onSelectEpoch,
  className = ''
}) => {
  return (
    <div className={`w-full bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--cosmic-cyan)]" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cosmic-text-muted)] font-mono">
            Observation Epoch Timeline (North Ecliptic Pole Field NEP-04)
          </h4>
        </div>
        <span className="text-[11px] font-mono text-[var(--cosmic-text-muted)]">
          Selected: <strong className="text-[var(--cosmic-cyan)]">Epoch {selectedEpoch}</strong>
        </span>
      </div>

      {/* Timeline track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {epochs.map(ep => {
          const isSelected = ep.id === selectedEpoch;

          return (
            <button
              key={ep.id}
              onClick={() => onSelectEpoch(ep.id)}
              className={`relative text-left p-3.5 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--cosmic-surface-hover)] border-[var(--cosmic-cyan)] shadow-sm'
                  : 'bg-[var(--cosmic-surface-subtle)] border-[var(--cosmic-border)] hover:bg-[var(--cosmic-surface-hover)] hover:border-[var(--cosmic-border-strong)]'
              }`}
            >
              {/* Active top line */}
              {isSelected && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--cosmic-cyan)] rounded-t-lg" />
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)]'
                        : 'bg-[var(--cosmic-surface)] text-[var(--cosmic-text-muted)] border border-[var(--cosmic-border)]'
                    }`}
                  >
                    {ep.id}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--cosmic-text-muted)]">
                    +{ep.timeBaselineFromT1Hours}h
                  </span>
                </div>

                <div className="text-xs font-semibold text-[var(--cosmic-text)] mb-1">
                  {ep.label.split('(')[0]}
                </div>

                <div className="text-[11px] font-mono text-[var(--cosmic-text-muted)] flex items-center gap-1 mb-2">
                  <Calendar className="w-3 h-3 text-[var(--cosmic-text-subtle)]" />
                  <span>{ep.timestamp.replace('T', ' ').substring(0, 16)} UTC</span>
                </div>
              </div>

              <div className="text-[11px] text-[var(--cosmic-text-muted)] line-clamp-2 border-t border-[var(--cosmic-border)] pt-2">
                {ep.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

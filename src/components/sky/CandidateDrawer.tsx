import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CandidateRecord } from '../../types/candidate';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { formatCoordinates } from '../../lib/astroUtils';
import { useSettings } from '../../context/SettingsContext';

interface CandidateDrawerProps {
  candidate: CandidateRecord | null;
  onClose: () => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({ candidate, onClose }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!candidate) return null;

  const { raStr, decStr } = formatCoordinates(candidate.ra, candidate.dec, settings.coordinateFormat);

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 max-w-[calc(100%-2rem)] bg-[var(--cosmic-surface)]/95 backdrop-blur-md border border-[var(--cosmic-border)] rounded-xl shadow-2xl p-4 flex flex-col z-20 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--cosmic-border)]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--cosmic-text-muted)]">Selected Candidate</span>
          <h3 className="text-base font-bold font-mono text-[var(--cosmic-cyan)] flex items-center gap-2">
            {candidate.id}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Badges & Scores */}
      <div className="py-3 flex flex-wrap items-center gap-2 border-b border-[var(--cosmic-border)]">
        <StatusBadge status={candidate.reviewStatus} size="sm" />
        <PriorityBadge priority={candidate.reviewPriority} />
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--cosmic-violet-subtle)] text-[var(--cosmic-violet)] border border-[var(--cosmic-violet)]/30 font-semibold">
          Score: {candidate.illustrativeScore.toFixed(1)}
        </span>
      </div>

      {/* Flag Reason */}
      <div className="py-3 text-xs text-[var(--cosmic-text)] leading-relaxed border-b border-[var(--cosmic-border)]">
        <p className="font-semibold text-[var(--cosmic-text-muted)] text-[11px] mb-1">DETECTION REASON:</p>
        <p>{candidate.flaggedReason}</p>
      </div>

      {/* Coordinate & Astrometry Stats */}
      <div className="py-3 space-y-2 text-xs font-mono border-b border-[var(--cosmic-border)]">
        <div className="flex justify-between text-[var(--cosmic-text-muted)]">
          <span>RA / Dec:</span>
          <span className="text-[var(--cosmic-text)] font-semibold">{raStr}, {decStr}</span>
        </div>
        <div className="flex justify-between text-[var(--cosmic-text-muted)]">
          <span>Galactic:</span>
          <span className="text-[var(--cosmic-text)]">l: {candidate.galacticL.toFixed(1)}°, b: {candidate.galacticB.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between text-[var(--cosmic-text-muted)]">
          <span>Apparent Rate:</span>
          <span className="text-[var(--cosmic-cyan)] font-semibold">{candidate.apparentMotionArcsecPerHour.toFixed(2)} ″/hr</span>
        </div>
        <div className="flex justify-between text-[var(--cosmic-text-muted)]">
          <span>Displacement:</span>
          <span className="text-[var(--cosmic-amber)] font-semibold">{candidate.estimatedDisplacementArcsec.toFixed(1)} arcsec</span>
        </div>
        <div className="flex justify-between text-[var(--cosmic-text-muted)]">
          <span>Observation Baseline:</span>
          <span className="text-[var(--cosmic-text)]">{candidate.epochCount} Epochs ({candidate.timeBaselineDays.toFixed(1)}d)</span>
        </div>
      </div>

      {/* Cross Match Result */}
      <div className="py-3 border-b border-[var(--cosmic-border)] text-xs">
        <div className="flex items-center gap-1.5 text-[var(--cosmic-text-muted)] mb-1">
          {candidate.crossMatch.status === 'Identified' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="font-semibold text-[var(--cosmic-text)]">Catalog Cross-Match:</span>
        </div>
        <p className="text-[var(--cosmic-text)] font-mono text-[11px]">
          {candidate.crossMatch.matchedDesignation || candidate.crossMatch.catalogName}
        </p>
        <p className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
          {candidate.crossMatch.notes}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-4 mt-auto">
        <button
          onClick={() => navigate(`/candidates/${candidate.id}`)}
          className="w-full py-2 px-3 rounded-lg bg-[var(--cosmic-cyan-subtle)] hover:bg-[var(--cosmic-cyan)] hover:text-black border border-[var(--cosmic-cyan)]/40 text-[var(--cosmic-cyan)] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm group"
        >
          <span>Open Candidate Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <p className="text-[9px] text-center text-[var(--cosmic-text-subtle)] mt-2 font-mono">
          WCS Astrometric Solution · ICRS J2000
        </p>
      </div>
    </div>
  );
};

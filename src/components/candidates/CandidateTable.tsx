import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateRecord } from '../../types/candidate';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { formatCoordinates } from '../../lib/astroUtils';
import { useSettings } from '../../context/SettingsContext';
import { ArrowUpDown, ArrowRight, Compass, CheckCircle2 } from 'lucide-react';

interface CandidateTableProps {
  candidates: CandidateRecord[];
  compact?: boolean;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  compact = false
}) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [sortField, setSortField] = useState<keyof CandidateRecord>('illustrativeScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: keyof CandidateRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    const modifier = sortAsc ? 1 : -1;
    if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * modifier;
    if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * modifier;
    return 0;
  });

  if (candidates.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl my-4">
        <p className="text-sm font-semibold text-[var(--cosmic-text)]">No candidates match the specified filter criteria.</p>
        <p className="text-xs text-[var(--cosmic-text-muted)] mt-1">Try resetting filters or adjusting the minimum score threshold.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] font-mono border-b border-[var(--cosmic-border)]">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[var(--cosmic-text)] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Candidate ID</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 font-semibold">RA / Dec (J2000)</th>

              <th
                onClick={() => handleSort('apparentMotionArcsecPerHour')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[var(--cosmic-text)] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Motion Rate</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {!compact && (
                <th
                  onClick={() => handleSort('epochCount')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-[var(--cosmic-text)] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Epochs</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
              )}

              {!compact && (
                <th className="py-3 px-4 font-semibold">Cross-Match</th>
              )}

              <th
                onClick={() => handleSort('illustrativeScore')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[var(--cosmic-text)] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Triage Score</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 font-semibold">Status</th>

              <th className="py-3 px-4 text-right font-semibold">→</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--cosmic-border)] font-mono">
            {sortedCandidates.map(candidate => {
              const { raStr, decStr } = formatCoordinates(candidate.ra, candidate.dec, settings.coordinateFormat);
              return (
                <tr
                  key={candidate.id}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  className="hover:bg-[var(--cosmic-surface-hover)] cursor-pointer transition-colors group"
                >
                  {/* Candidate ID */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--cosmic-cyan)] group-hover:text-[var(--cosmic-text)] transition-colors">
                        {candidate.id}
                      </span>
                      <PriorityBadge priority={candidate.reviewPriority} />
                    </div>
                  </td>

                  {/* Coordinates */}
                  <td className="py-3 px-4 text-[var(--cosmic-text)]">
                    <span className="font-semibold">{raStr}</span>
                    <span className="text-[var(--cosmic-text-muted)] ml-1">{decStr}</span>
                  </td>

                  {/* Motion Rate */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[var(--cosmic-text-subtle)] group-hover:text-[var(--cosmic-cyan)] transition-colors" />
                      <span className="font-semibold text-[var(--cosmic-text)]">
                        {candidate.apparentMotionArcsecPerHour.toFixed(2)} ″/hr
                      </span>
                    </div>
                  </td>

                  {/* Epochs */}
                  {!compact && (
                    <td className="py-3 px-4 text-[var(--cosmic-text-muted)]">
                      <span className="px-2 py-0.5 rounded bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text)] border border-[var(--cosmic-border)] font-medium text-[11px]">
                        {candidate.epochCount} sweeps
                      </span>
                    </td>
                  )}

                  {/* Cross-Match */}
                  {!compact && (
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {candidate.crossMatch.status === 'Identified' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : candidate.crossMatch.status === 'Unmatched' ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[var(--cosmic-cyan)]" />
                        )}
                        <span className="truncate max-w-[170px] text-[var(--cosmic-text-muted)] text-[11px]">
                          {candidate.crossMatch.matchedDesignation || candidate.crossMatch.catalogName}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Triage Score */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-[var(--cosmic-surface-subtle)] rounded-full h-1.5 overflow-hidden border border-[var(--cosmic-border)]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            candidate.illustrativeScore >= 85
                              ? 'bg-[var(--cosmic-cyan)]'
                              : candidate.illustrativeScore >= 70
                              ? 'bg-[var(--cosmic-violet)]'
                              : 'bg-[var(--cosmic-text-subtle)]'
                          }`}
                          style={{ width: `${candidate.illustrativeScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-[var(--cosmic-text)] text-xs">
                        {candidate.illustrativeScore.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Review Status */}
                  <td className="py-3 px-4 font-sans">
                    <StatusBadge status={candidate.reviewStatus} size="sm" />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/candidates/${candidate.id}`);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-subtle)] hover:text-[var(--cosmic-cyan)] transition-colors"
                      title="Inspect Candidate"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      <div className="px-4 py-2.5 bg-[var(--cosmic-surface-subtle)] border-t border-[var(--cosmic-border)] flex items-center justify-between text-[11px] text-[var(--cosmic-text-muted)] font-mono">
        <span>Showing {candidates.length} candidate record{candidates.length !== 1 ? 's' : ''}</span>
        <span className="text-[var(--cosmic-amber)] font-medium">Mock catalog · illustrative data · ICRS J2000</span>
      </div>
    </div>
  );
};

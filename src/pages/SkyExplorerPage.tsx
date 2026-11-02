import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { observationService } from '../services/observationService';
import { candidateService } from '../services/candidateService';
import { ObservationMetadata, ObservationEpoch, EpochId } from '../types/observation';
import { CandidateRecord, CandidateStatus } from '../types/candidate';
import { SkyFieldViewer } from '../components/sky/SkyFieldViewer';
import { LoadingState } from '../components/ui/LoadingState';
import { formatCoordinates } from '../lib/astroUtils';
import { useSettings } from '../context/SettingsContext';

export const SkyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [observations, setObservations] = useState<ObservationMetadata[]>([]);
  const [epochs, setEpochs] = useState<ObservationEpoch[]>([]);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [selectedEpoch, setSelectedEpoch] = useState<EpochId>('T1');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'All'>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // NOTE: No selectedCandidate state here. The SkyFieldViewer manages its own
  // activeCandidate internally and shows the CandidateDrawer inside the canvas.
  // We do not duplicate that information in a second external panel.

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [loadedEpochs, loadedObs, loadedCandidates] = await Promise.all([
          observationService.getEpochs(),
          observationService.getObservations(),
          candidateService.getCandidates()
        ]);
        setEpochs(loadedEpochs);
        setObservations(loadedObs);
        setCandidates(loadedCandidates);
        // No candidate pre-selected — drawer starts closed
      } catch (err) {
        console.error('Error loading Sky Explorer data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentObservation = observations.find(o => o.epoch === selectedEpoch) || observations[0];

  // Apply filters; if filter changes and selected candidate disappears, the
  // SkyFieldViewer's internal useEffect clears it automatically.
  const filteredCandidates = candidates.filter(cand => {
    if (statusFilter !== 'All' && cand.reviewStatus !== statusFilter) return false;
    if (cand.illustrativeScore < minScore) return false;
    return true;
  });

  if (loading) {
    return <LoadingState message="Loading Sky Explorer…" subMessage="Projecting celestial coordinate sphere" />;
  }

  const { raStr, decStr } = currentObservation
    ? formatCoordinates(currentObservation.centerRa, currentObservation.centerDec, settings.coordinateFormat)
    : { raStr: '—', decStr: '—' };

  return (
    <div className="space-y-4">
      {/* Compact header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
              Sky Explorer
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)] border border-[var(--cosmic-amber)]/30">
              MOCK DATA
            </span>
          </div>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
            {filteredCandidates.length} of {candidates.length} candidates visible · click a marker to inspect
          </p>
        </div>
        <button
          onClick={() => navigate('/comparison')}
          className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-cyan)] text-xs font-mono text-[var(--cosmic-cyan)] flex items-center gap-1.5 transition-colors"
        >
          Blink Comparator <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main layout: large sky (3 col) + compact sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Sky canvas — 3 of 4 cols */}
        <div className="lg:col-span-3 space-y-2">
          {/*
            SkyFieldViewer manages selection entirely internally.
            - No selectedCandidateId prop: prevents auto-selection on mount.
            - No onSelectCandidate prop: no external state duplication.
            - Clicking a marker opens the CandidateDrawer inside the canvas.
            - Clicking empty canvas closes the drawer.
            - Pressing Escape closes the drawer.
            - Changing epoch or filter that removes the selected candidate auto-clears it.
          */}
          <SkyFieldViewer
            candidates={filteredCandidates}
            selectedEpoch={selectedEpoch}
            heightClass="h-[580px]"
            showDrawer={true}
          />

          {/* Epoch pill row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[var(--cosmic-text-muted)]">Epoch:</span>
            {epochs.map(ep => (
              <button
                key={ep.id}
                onClick={() => setSelectedEpoch(ep.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                  selectedEpoch === ep.id
                    ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border-[var(--cosmic-cyan)]/40 font-semibold'
                    : 'bg-[var(--cosmic-surface)] text-[var(--cosmic-text-muted)] border-[var(--cosmic-border)] hover:text-[var(--cosmic-text)]'
                }`}
              >
                {ep.id} +{ep.timeBaselineFromT1Hours}h
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar: field metadata + filters only. No second candidate detail panel. */}
        <div className="space-y-3">
          {/* Field metadata */}
          {currentObservation && (
            <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--cosmic-text-muted)] block">
                Field · {currentObservation.targetRegion}
              </span>
              <div className="space-y-1.5 text-[11px] font-mono">
                {[
                  { label: 'Center RA', value: raStr },
                  { label: 'Center Dec', value: decStr },
                  { label: 'FOV', value: `${currentObservation.fovDeg}°` },
                  { label: 'Band', value: currentObservation.filterBand.split(' ')[0] },
                  { label: 'Exposure', value: `${currentObservation.exposureSec}s` },
                  { label: 'Quality', value: `${currentObservation.qualityScore.toFixed(1)}%` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-[var(--cosmic-text-muted)]">
                    <span>{row.label}</span>
                    <span className="text-[var(--cosmic-text)] text-right max-w-[110px] truncate">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spatial filter controls */}
          <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-lg p-3 space-y-3">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--cosmic-text-muted)] block">
              Overlay Filters
            </span>

            <div>
              <label className="text-[10px] font-mono text-[var(--cosmic-text-muted)] block mb-1">Status:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as CandidateStatus | 'All')}
                className="w-full px-2 py-1.5 rounded bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs text-[var(--cosmic-text)] focus:outline-none focus:border-[var(--cosmic-cyan)] font-mono transition-colors"
              >
                <option value="All">All statuses</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Known Object Match">Known Object Match</option>
                <option value="Possible Artifact">Possible Artifact</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-[var(--cosmic-text-muted)] mb-1">
                <span>Min score (illus.):</span>
                <span className="text-[var(--cosmic-cyan)]">{minScore}</span>
              </div>
              <input
                type="range" min="0" max="90" step="5"
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-[var(--cosmic-cyan)] cursor-pointer"
              />
            </div>

            {(statusFilter !== 'All' || minScore > 0) && (
              <button
                onClick={() => { setStatusFilter('All'); setMinScore(0); }}
                className="w-full py-1 rounded bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-[10px] font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Hint — replaces the previously duplicated candidate panel */}
          <div className="px-3 py-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-[10px] font-mono text-[var(--cosmic-text-subtle)] leading-relaxed">
            Click any marker to inspect · Esc to dismiss · click empty sky to deselect
          </div>
        </div>
      </div>
    </div>
  );
};

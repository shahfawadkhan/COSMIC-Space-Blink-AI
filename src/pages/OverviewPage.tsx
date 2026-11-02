import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SplitSquareVertical, Crosshair, Compass, Settings } from 'lucide-react';
import { observationService } from '../services/observationService';
import { candidateService } from '../services/candidateService';
import { ObservationEpoch, EpochId } from '../types/observation';
import { CandidateRecord } from '../types/candidate';
import { SkyFieldViewer } from '../components/sky/SkyFieldViewer';
import { LoadingState } from '../components/ui/LoadingState';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const [epochs, setEpochs] = useState<ObservationEpoch[]>([]);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [selectedEpoch, setSelectedEpoch] = useState<EpochId>('T1');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [loadedEpochs, loadedCandidates] = await Promise.all([
          observationService.getEpochs(),
          candidateService.getCandidates()
        ]);
        setEpochs(loadedEpochs);
        setCandidates(loadedCandidates);
        // No candidate is selected by default — drawer closed on load
      } catch (err) {
        console.error('Error loading overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading workspace…" subMessage="Fetching mock observation catalog" />;
  }

  const needsReview = candidates.filter(c => c.reviewStatus === 'Needs Review').length;
  const uncatalogued = candidates.filter(c => c.crossMatch.status === 'Unmatched').length;

  return (
    <div className="space-y-5">
      {/* Mission heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
              COSMIC Space Blink
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30">
              Survey Field NEP-04
            </span>
          </div>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
            SPHEREx multi-epoch blink &amp; moving-object triage workstation
          </p>
        </div>
      </div>

      {/* Compact survey summary */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-mono text-[var(--cosmic-text-muted)] px-0.5">
        <span>Survey region: <strong className="text-[var(--cosmic-text)]">NEP-04</strong></span>
        <span>Epochs: <strong className="text-[var(--cosmic-text)]">{epochs.length} (T1 – T{epochs.length})</strong></span>
        <span>Candidates: <strong className="text-[var(--cosmic-text)]">{candidates.length}</strong></span>
        {needsReview > 0 && (
          <span className="text-[var(--cosmic-amber)]">{needsReview} need review</span>
        )}
        {uncatalogued > 0 && (
          <span className="text-[var(--cosmic-amber)]">{uncatalogued} uncatalogued</span>
        )}
      </div>

      {/* Sky preview — no candidate pre-selected, drawer closed by default */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[var(--cosmic-text-muted)] uppercase tracking-wider">
            Sky preview · click a marker to inspect
          </span>
          <div className="flex items-center gap-1.5">
            {epochs.map(ep => (
              <button
                key={ep.id}
                onClick={() => setSelectedEpoch(ep.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${
                  selectedEpoch === ep.id
                    ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border-[var(--cosmic-cyan)]/40 font-semibold'
                    : 'bg-[var(--cosmic-surface)] text-[var(--cosmic-text-muted)] border-[var(--cosmic-border)] hover:text-[var(--cosmic-text)]'
                }`}
              >
                {ep.id}
              </button>
            ))}
          </div>
        </div>

        {/*
          Intentionally no selectedCandidateId and no onSelectCandidate that pre-sets state.
          The viewer manages its own local activeCandidate; drawer starts closed.
          Clicking a marker opens the contextual drawer inside the viewer.
          Use the Sky Map page for full spatial exploration and filtering.
        */}
        <SkyFieldViewer
          candidates={candidates}
          selectedEpoch={selectedEpoch}
          heightClass="h-[400px]"
          showDrawer={true}
        />
      </div>

      {/* Navigation links to workspaces — the primary purpose of this page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/comparison')}
          className="p-4 rounded-xl bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-cyan)] text-left transition-colors group"
        >
          <SplitSquareVertical className="w-5 h-5 text-[var(--cosmic-cyan)] mb-2" />
          <div className="text-xs font-bold font-mono text-[var(--cosmic-text)] mb-0.5">Blink Comparator</div>
          <div className="text-[10px] text-[var(--cosmic-text-muted)] font-mono leading-snug">
            Compare two epochs side-by-side, swipe, difference, or blink
          </div>
        </button>

        <button
          onClick={() => navigate('/candidates')}
          className="p-4 rounded-xl bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-amber)] text-left transition-colors group relative"
        >
          <Crosshair className="w-5 h-5 text-[var(--cosmic-amber)] mb-2" />
          <div className="text-xs font-bold font-mono text-[var(--cosmic-text)] mb-0.5 flex items-center gap-2">
            Candidate Queue
            {needsReview > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)] border border-[var(--cosmic-amber)]/30 font-mono">
                {needsReview}
              </span>
            )}
          </div>
          <div className="text-[10px] text-[var(--cosmic-text-muted)] font-mono leading-snug">
            Filter, rank, and triage all flagged moving-object candidates
          </div>
        </button>

        <button
          onClick={() => navigate('/sky')}
          className="p-4 rounded-xl bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-violet)] text-left transition-colors group"
        >
          <Compass className="w-5 h-5 text-[var(--cosmic-violet)] mb-2" />
          <div className="text-xs font-bold font-mono text-[var(--cosmic-text)] mb-0.5">Sky Explorer</div>
          <div className="text-[10px] text-[var(--cosmic-text-muted)] font-mono leading-snug">
            Interactive sky map with spatial filtering, motion overlays, and epoch sweep
          </div>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="p-4 rounded-xl bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-border-strong)] text-left transition-colors group"
        >
          <Settings className="w-5 h-5 text-[var(--cosmic-text-muted)] mb-2" />
          <div className="text-xs font-bold font-mono text-[var(--cosmic-text)] mb-0.5">Configuration</div>
          <div className="text-[10px] text-[var(--cosmic-text-muted)] font-mono leading-snug">
            Astrometry parameters, blink comparator defaults, and pipeline API connectivity
          </div>
        </button>
      </div>

      {/* Minimal recent candidates — IDs + status only, links to full queue */}
      {candidates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--cosmic-text-muted)]">
              Recent — {candidates.slice(0, 4).length} of {candidates.length}
            </span>
            <button
              onClick={() => navigate('/candidates')}
              className="text-[10px] font-mono text-[var(--cosmic-cyan)] hover:underline"
            >
              View full queue →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {candidates.slice(0, 4).map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/candidates/${c.id}`)}
                className="p-2.5 rounded-lg bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] hover:border-[var(--cosmic-cyan)] text-left transition-colors"
              >
                <div className="text-[11px] font-bold font-mono text-[var(--cosmic-cyan)]">{c.id}</div>
                <div className="text-[10px] text-[var(--cosmic-text-muted)] font-mono mt-0.5">
                  {c.apparentMotionArcsecPerHour.toFixed(2)} ″/hr · {c.reviewStatus}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

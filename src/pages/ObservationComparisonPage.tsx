import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Compass, AlertTriangle, FlaskConical } from 'lucide-react';
import { observationService } from '../services/observationService';
import { ObservationMetadata, DifferenceMetric, EpochId } from '../types/observation';
import { ComparisonViewer } from '../components/observations/ComparisonViewer';
import { LoadingState } from '../components/ui/LoadingState';

export const ObservationComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // URL or State-based initial epochs
  const initialEpochA = (searchParams.get('epochA') as EpochId) || 'T1';
  const initialEpochB = (searchParams.get('epochB') as EpochId) || 'T2';
  const targetLabel = searchParams.get('target') || location.state?.targetName;

  const [observations, setObservations] = useState<ObservationMetadata[]>([]);
  const [diffMetrics, setDiffMetrics] = useState<DifferenceMetric[]>([]);

  const [epochA, setEpochA] = useState<EpochId>(initialEpochA);
  const [epochB, setEpochB] = useState<EpochId>(initialEpochB);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [loadedObs, loadedDiffs] = await Promise.all([
          observationService.getObservations(),
          observationService.getDifferenceMetrics('T1', 'T2')
        ]);

        // If navigated from ExploreSkyPage with a specific sequence, prefer those observations
        const passedObs: ObservationMetadata[] = location.state?.observations;
        if (passedObs && passedObs.length > 0) {
          // Merge passed observations
          const merged = [...passedObs];
          loadedObs.forEach(lo => {
            if (!merged.find(m => m.epoch === lo.epoch)) {
              merged.push(lo);
            }
          });
          setObservations(merged);
        } else {
          setObservations(loadedObs);
        }

        setDiffMetrics(loadedDiffs);
      } catch (err) {
        console.error('Error loading comparison data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [location.state]);

  const obsA = observations.find(o => o.epoch === epochA) || observations[0];
  const obsB = observations.find(o => o.epoch === epochB) || observations[1] || observations[0];

  if (loading || !obsA || !obsB) {
    return (
      <LoadingState
        message="Loading Blink Workspace…"
        subMessage="Preparing simulated epoch cutouts"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact toolbar: title + epoch selectors on one line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
              Multi-Epoch Observation Viewer
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30">
              {observations.length} Available Epochs
            </span>
            {/* Clear SIMULATED DATA badge */}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              SIMULATED DATA
            </span>
          </div>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
            Chronological playback · Blink · Side-by-side · Swipe · Simulated Difference
            {targetLabel && (
              <span className="text-[var(--cosmic-cyan)] ml-1 font-semibold">
                · Target Sequence: {targetLabel}
              </span>
            )}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors cursor-pointer"
            title="Return to Explore Sky Coordinate Search"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            <span>Explore Sky</span>
          </button>

          <button
            onClick={() => navigate('/analysis', { state: location.state })}
            id="comparison-nav-analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-violet)]/40 hover:border-[var(--cosmic-violet)] text-xs font-mono text-[var(--cosmic-violet)] transition-colors cursor-pointer font-semibold"
            title="Open Multi-Epoch Scientific Analysis Workspace"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Scientific Analysis</span>
          </button>
        </div>
      </div>

      {/* Multi-Epoch Observation Viewer */}
      <ComparisonViewer
        observations={observations}
        obsA={obsA}
        obsB={obsB}
        targetName={targetLabel}
        differenceMetrics={diffMetrics}
        onSelectCandidate={id => navigate(`/candidates/${id}`)}
        onSelectEpochPair={(newA, newB) => {
          setEpochA(newA);
          setEpochB(newB);
        }}
      />
    </div>
  );
};

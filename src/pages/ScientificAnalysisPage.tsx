import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FlaskConical, AlertTriangle, ArrowLeft, SplitSquareVertical, Compass } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { AnalysisSource, AnalysisTab } from '../types/analysis';
import { AnalysisWorkspace } from '../components/analysis/AnalysisWorkspace';
import { LoadingState } from '../components/ui/LoadingState';

export const ScientificAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const initialSourceId = searchParams.get('source') || location.state?.sourceId;
  const initialTab = (searchParams.get('tab') as AnalysisTab) || 'astrometry';
  const targetLabel = searchParams.get('target') || location.state?.targetName;

  const [sources, setSources] = useState<AnalysisSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService.getSources()
      .then(data => setSources(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <LoadingState
        message="Loading Analysis Workspace…"
        subMessage="Preparing candidate source catalog"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
              Scientific Analysis Workspace
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-violet)] border border-[var(--cosmic-violet)]/30">
              {sources.length} Sources
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              ILLUSTRATIVE DATA
            </span>
          </div>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
            Astrometric motion · Light curve · Spectral SED — all analyses use illustrative mock data
            {targetLabel && (
              <span className="text-[var(--cosmic-cyan)] ml-1 font-semibold">
                · {targetLabel}
              </span>
            )}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => navigate('/')}
            id="analysis-nav-explore"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors cursor-pointer"
            title="Return to Explore Sky"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            <span>Explore Sky</span>
          </button>
          <button
            onClick={() => navigate('/comparison', { state: location.state })}
            id="analysis-nav-viewer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors cursor-pointer"
            title="Return to Multi-Epoch Observation Viewer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <SplitSquareVertical className="w-3.5 h-3.5 text-[var(--cosmic-violet)]" />
            <span>Observation Viewer</span>
          </button>
        </div>
      </div>

      {/* Analysis workspace */}
      {sources.length > 0 ? (
        <AnalysisWorkspace
          sources={sources}
          initialSourceId={initialSourceId || sources[0]?.id}
          initialTab={initialTab}
        />
      ) : (
        <div className="obs-card p-8 text-center">
          <FlaskConical className="w-8 h-8 mx-auto text-[var(--cosmic-text-subtle)] mb-3" />
          <p className="text-sm font-mono text-[var(--cosmic-text-muted)]">No candidate sources found in catalog.</p>
        </div>
      )}
    </div>
  );
};

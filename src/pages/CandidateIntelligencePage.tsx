import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { candidateService } from '../services/candidateService';
import { CandidateRecord, CandidateFilterParams } from '../types/candidate';
import { CandidateTable } from '../components/candidates/CandidateTable';
import { CandidateFilters } from '../components/candidates/CandidateFilters';
import { LoadingState } from '../components/ui/LoadingState';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const CandidateIntelligencePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';

  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [criteriaOpen, setCriteriaOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<CandidateFilterParams>({
    searchQuery: qParam,
    status: 'All',
    priority: 'All',
    crossMatchFilter: 'All',
    minScore: 0,
    minEpochs: 1
  });

  // Sync when URL search parameter changes
  useEffect(() => {
    if (qParam !== filters.searchQuery) {
      setFilters(prev => ({ ...prev, searchQuery: qParam }));
    }
  }, [qParam]);

  const loadCandidates = async (activeFilters?: CandidateFilterParams) => {
    try {
      setLoading(true);
      const data = await candidateService.getCandidates(activeFilters);
      setCandidates(data);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<CandidateFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      priority: 'All',
      crossMatchFilter: 'All',
      minScore: 0,
      minEpochs: 1
    });
  };

  return (
    <div className="space-y-4">
      {/* Page heading row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
              Candidate Queue
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border border-[var(--cosmic-border)]">
              Prototype Catalog
            </span>
          </div>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} · multi-epoch moving-object triage
          </p>
        </div>
      </div>

      {/* Collapsible detection criteria — compact, not the primary focus */}
      <div className="border border-[var(--cosmic-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setCriteriaOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2 bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] transition-colors text-left"
        >
          <span className="text-xs font-mono text-[var(--cosmic-text-muted)]">
            Detection &amp; Triage Criteria (Configurable)
          </span>
          {criteriaOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[var(--cosmic-text-muted)]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--cosmic-text-muted)]" />
          )}
        </button>

        {criteriaOpen && (
          <div className="px-4 py-3 bg-[var(--cosmic-surface-subtle)] border-t border-[var(--cosmic-border)] text-[11px] font-mono text-[var(--cosmic-text-muted)] space-y-1.5">
            <p>Candidate detections are evaluated across multi-epoch sweeps:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <span className="text-[var(--cosmic-text)]">Apparent motion</span> — astrometric shift &gt;0.2 ″/hr consistent across ≥2 epochs
              </li>
              <li>
                <span className="text-[var(--cosmic-text)]">Epoch repeatability</span> — photometric detection in multiple sweeps, rejecting single-epoch artifacts
              </li>
              <li>
                <span className="text-[var(--cosmic-text)]">PSF asymmetry</span> — point-source radial symmetry metric &lt;0.15
              </li>
              <li>
                <span className="text-[var(--cosmic-text)]">Catalog cross-match</span> — comparison against known orbital ephemerides (JPL Horizons / Minor Planet Center)
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Filters */}
      <CandidateFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Candidate table — primary element */}
      {loading ? (
        <LoadingState message="Filtering candidates…" subMessage="Scanning candidate catalog indices" />
      ) : (
        <CandidateTable candidates={candidates} compact={false} />
      )}
    </div>
  );
};

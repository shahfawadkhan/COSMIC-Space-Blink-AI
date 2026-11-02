import React from 'react';
import { CandidateFilterParams, CandidateStatus, CandidatePriority } from '../../types/candidate';
import { Search, RotateCcw } from 'lucide-react';

interface CandidateFiltersProps {
  filters: CandidateFilterParams;
  onFilterChange: (newFilters: Partial<CandidateFilterParams>) => void;
  onReset: () => void;
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs text-[var(--cosmic-text)] focus:outline-none focus:border-[var(--cosmic-cyan)] cursor-pointer font-mono placeholder:text-[var(--cosmic-text-subtle)] transition-colors';

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  return (
    <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-4 space-y-3">
      {/* Primary filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--cosmic-text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate ID, designation…"
            value={filters.searchQuery || ''}
            onChange={e => onFilterChange({ searchQuery: e.target.value })}
            className={`${inputClass} pl-9`}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status || 'All'}
          onChange={e => onFilterChange({ status: e.target.value as CandidateStatus | 'All' })}
          className={inputClass}
        >
          <option value="All">All Review Statuses</option>
          <option value="Needs Review">Needs Review</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Known Object Match">Known Object Match</option>
          <option value="Possible Artifact">Possible Artifact</option>
          <option value="Archived">Archived</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority || 'All'}
          onChange={e => onFilterChange({ priority: e.target.value as CandidatePriority | 'All' })}
          className={inputClass}
        >
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        {/* Cross-match */}
        <select
          value={filters.crossMatchFilter || 'All'}
          onChange={e => onFilterChange({ crossMatchFilter: e.target.value })}
          className={inputClass}
        >
          <option value="All">All Cross-Match Results</option>
          <option value="Unmatched">Unmatched (New Discovery)</option>
          <option value="Identified">Identified Catalog Match</option>
          <option value="Candidate">Corridor Candidate</option>
          <option value="Variable Star">Variable Star Counterpart</option>
        </select>
      </div>

      {/* Secondary row: sliders + reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-[var(--cosmic-border)] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-6">
          {/* Min Score slider */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--cosmic-text-muted)] text-[11px]">Min Score:</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={filters.minScore || 0}
              onChange={e => onFilterChange({ minScore: Number(e.target.value) })}
              className="w-24 accent-[var(--cosmic-cyan)] cursor-pointer"
            />
            <span className="text-[var(--cosmic-cyan)] font-semibold text-xs">
              {filters.minScore || 0}+
            </span>
          </div>

          {/* Min Epochs */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--cosmic-text-muted)] text-[11px]">Min Epochs:</span>
            <select
              value={filters.minEpochs || 1}
              onChange={e => onFilterChange({ minEpochs: Number(e.target.value) })}
              className="bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] px-2 py-1 rounded-lg text-xs text-[var(--cosmic-text)] focus:outline-none focus:border-[var(--cosmic-cyan)] transition-colors"
            >
              <option value={1}>1+ Epoch</option>
              <option value={2}>2+ Epochs (Moving)</option>
              <option value={4}>4 Epochs (Complete)</option>
            </select>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors text-[11px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
};

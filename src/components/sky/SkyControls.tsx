import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Grid, Crosshair, Navigation } from 'lucide-react';

interface SkyControlsProps {
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showCandidates: boolean;
  setShowCandidates: (val: boolean) => void;
  showTracks: boolean;
  setShowTracks: (val: boolean) => void;
  showSources: boolean;
  setShowSources: (val: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const SkyControls: React.FC<SkyControlsProps> = ({
  showGrid,
  setShowGrid,
  showCandidates,
  setShowCandidates,
  showTracks,
  setShowTracks,
  showSources,
  setShowSources,
  onZoomIn,
  onZoomOut,
  onReset
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Zoom / Pan Controls */}
      <div className="flex items-center rounded-lg bg-[var(--cosmic-surface)]/95 backdrop-blur border border-[var(--cosmic-border)] p-1 shadow-sm">
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-1.5 rounded hover:bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-cyan)] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 rounded hover:bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-cyan)] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          title="Reset View"
          className="p-1.5 rounded hover:bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="flex items-center gap-1 rounded-lg bg-[var(--cosmic-surface)]/95 backdrop-blur border border-[var(--cosmic-border)] p-1 text-xs shadow-sm">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            showGrid
              ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] font-semibold border border-[var(--cosmic-cyan)]/30'
              : 'text-[var(--cosmic-text-muted)] hover:bg-[var(--cosmic-surface-hover)] hover:text-[var(--cosmic-text)]'
          }`}
          title="Toggle Celestial Coordinate Grid"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>

        <button
          onClick={() => setShowCandidates(!showCandidates)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            showCandidates
              ? 'bg-[var(--cosmic-violet-subtle)] text-[var(--cosmic-violet)] font-semibold border border-[var(--cosmic-violet)]/30'
              : 'text-[var(--cosmic-text-muted)] hover:bg-[var(--cosmic-surface-hover)] hover:text-[var(--cosmic-text)]'
          }`}
          title="Toggle Candidate Overlays"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Candidates</span>
        </button>

        <button
          onClick={() => setShowTracks(!showTracks)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            showTracks
              ? 'bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)] font-semibold border border-[var(--cosmic-amber)]/30'
              : 'text-[var(--cosmic-text-muted)] hover:bg-[var(--cosmic-surface-hover)] hover:text-[var(--cosmic-text)]'
          }`}
          title="Toggle Astrometric Motion Tracks"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Tracks</span>
        </button>

        <button
          onClick={() => setShowSources(!showSources)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            showSources
              ? 'bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text)] font-semibold border border-[var(--cosmic-border)]'
              : 'text-[var(--cosmic-text-subtle)] hover:bg-[var(--cosmic-surface-hover)] hover:text-[var(--cosmic-text)]'
          }`}
          title="Toggle Background Field Stars"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Stars</span>
        </button>
      </div>
    </div>
  );
};

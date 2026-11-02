import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Cpu,
  Database,
  SplitSquareVertical,
  ChevronDown,
  ChevronUp,
  FileCode,
  Crosshair,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ObservationMetadata, EpochId } from '../../types/observation';

interface EpochObservationCardProps {
  observation: ObservationMetadata;
  onOpenComparison?: (epoch: EpochId) => void;
  targetName?: string;
}

export const EpochObservationCard: React.FC<EpochObservationCardProps> = ({
  observation,
  onOpenComparison,
  targetName
}) => {
  const [showHeaders, setShowHeaders] = useState(false);

  return (
    <div className="obs-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:border-[var(--cosmic-cyan)]/50 group">
      <div>
        {/* Top Header: Epoch Badge, ID, and SIMULATED DATA badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--cosmic-border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30 tracking-wide">
              EPOCH {observation.epoch}
            </span>
            <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">
              {observation.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Illustrative Pipeline State Badge */}
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-[var(--cosmic-border)] bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] flex items-center gap-1">
              <span>Mock {observation.status}</span>
              <span className="text-[9px] opacity-75">(Illustrative)</span>
            </span>

            {/* MANDATORY SIMULATED DATA BADGE */}
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              SIMULATED DATA
            </span>
          </div>
        </div>

        {/* Target Region Designation */}
        <div className="mt-3 mb-4">
          <h3 className="text-sm font-semibold font-mono text-[var(--cosmic-text)] flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            {targetName ? `${targetName} · ${observation.targetRegion}` : observation.targetRegion}
          </h3>
          <p className="text-[11px] font-mono text-[var(--cosmic-text-muted)] mt-0.5">
            Pointing: RA {observation.centerRa.toFixed(4)}°, Dec {observation.centerDec >= 0 ? '+' : ''}{observation.centerDec.toFixed(4)}° · FOV {(observation.fovDeg * 60).toFixed(0)}′ (Tile {observation.simulatedTilePattern})
          </p>
        </div>

        {/* Key Observation Information Elements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {/* 1. Observation Date */}
          <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
            <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] text-[11px] font-medium mb-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
              <span>Observation Date &amp; Time</span>
            </div>
            <div className="text-[var(--cosmic-text)] font-semibold">
              {observation.timestamp.replace('T', ' ').replace('Z', ' UTC')}
            </div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
              Julian Date: {observation.julianDate.toFixed(4)} (Simulated Cadence)
            </div>
          </div>

          {/* 2. Broad Spectral Band & Channel Coverage */}
          <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
            <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] text-[11px] font-medium mb-1">
              <Layers className="w-3.5 h-3.5 text-[var(--cosmic-violet)]" />
              <span>Broad Spectral Band</span>
            </div>
            <div className="text-[var(--cosmic-text)] font-semibold truncate" title={observation.filterBand}>
              {observation.filterBand}
            </div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
              {observation.spectralChannels ? (
                <span>Channels: <strong className="text-[var(--cosmic-text)]">{observation.spectralChannels}</strong> · Exp: {observation.exposureSec}s</span>
              ) : (
                <span>Broadband filter cutout · Exp: {observation.exposureSec}s</span>
              )}
            </div>
          </div>

          {/* 3. Detector Subsystem Assignment (General specs moved to separate section) */}
          <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
            <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] text-[11px] font-medium mb-1">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              <span>Focal Plane Array Assignment</span>
            </div>
            <div className="text-[var(--cosmic-text)] font-semibold truncate" title={observation.detector?.focalPlaneArray || 'Focal Plane Array'}>
              {observation.detector?.focalPlaneArray || 'Cryogenic H2RG Array'}
            </div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
              Detector ID: {observation.fitsHeaders?.DETNAME || 'SCA-10x'} · See reference below for detector specs
            </div>
          </div>

          {/* 4. Test Fixture Pipeline State (Removed misleading QA and noise measurements) */}
          <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
            <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] text-[11px] font-medium mb-1">
              <Info className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
              <span>Test Fixture Pipeline State</span>
            </div>
            <div className="text-[var(--cosmic-text)] font-semibold flex items-center justify-between">
              <span>{observation.status}</span>
              <span className="text-amber-500 text-[10px] font-normal">[Illustrative Mock Data]</span>
            </div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
              Tile: <span className="font-mono text-[var(--cosmic-text)]">{observation.simulatedTilePattern}</span> · No flight QA measured
            </div>
          </div>
        </div>

        {/* 5. Data Provenance & Origin */}
        <div className="mt-3 p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] text-[11px] font-medium mb-1">
            <Database className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            <span>Data Provenance</span>
          </div>
          <div className="text-[var(--cosmic-text)] text-[11px] font-medium flex items-center justify-between gap-2">
            <span>Synthetic test data — not retrieved from IRSA.</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 shrink-0">
              SIMULATED DATA
            </span>
          </div>
        </div>

        {/* Collapsible FITS Header Metadata */}
        {observation.fitsHeaders && (
          <div className="mt-3">
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[11px] font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
                <span>Primary FITS Header Cards</span>
              </span>
              {showHeaders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHeaders && (
              <div className="mt-2 p-3 rounded-lg bg-black/40 border border-[var(--cosmic-border)] font-mono text-[10px] text-[var(--cosmic-text-muted)] space-y-1 overflow-x-auto">
                <div className="text-[var(--cosmic-text-subtle)] mb-1.5 font-semibold">
                  # SYNTHETIC FITS KEYWORDS (ILLUSTRATIVE TEST RECORD)
                </div>
                {Object.entries(observation.fitsHeaders).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 font-mono">
                    <span className="text-[var(--cosmic-cyan)]">{k.padEnd(8, ' ')} =</span>
                    <span className="text-[var(--cosmic-text)] truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Action Bar */}
      <div className="mt-4 pt-3 border-t border-[var(--cosmic-border)] flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-[var(--cosmic-text-muted)]">
          Illustrative simulated cutouts · Not genuine flight survey data
        </span>

        {onOpenComparison && (
          <button
            onClick={() => onOpenComparison(observation.epoch)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-cyan)]/40 hover:border-[var(--cosmic-cyan)] text-xs font-mono font-semibold text-[var(--cosmic-cyan)] transition-colors cursor-pointer"
            title={`Open Epoch ${observation.epoch} in Blink Comparator`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Compare Epoch</span>
          </button>
        )}
      </div>
    </div>
  );
};



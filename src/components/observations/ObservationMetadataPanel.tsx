import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Cpu,
  Database,
  Crosshair,
  FileCode,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ObservationMetadata } from '../../types/observation';

interface ObservationMetadataPanelProps {
  observation: ObservationMetadata;
  isOpenDefault?: boolean;
}

export const ObservationMetadataPanel: React.FC<ObservationMetadataPanelProps> = ({
  observation,
  isOpenDefault = false
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [showFits, setShowFits] = useState(false);

  return (
    <div className="obs-card border-[var(--cosmic-border)] bg-[var(--cosmic-surface)] text-xs font-mono overflow-hidden">
      {/* Header bar toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--cosmic-surface-hover)] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--cosmic-cyan)] shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[var(--cosmic-text)]">
              Observation Metadata &amp; Provenance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30 font-semibold">
              Epoch {observation.epoch} · {observation.id}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
              SIMULATED RECORD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] hover:text-[var(--cosmic-text)]">
          <span className="text-[10px]">{isOpen ? 'Hide Panel' : 'Show Panel'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded panel content */}
      {isOpen && (
        <div className="p-4 pt-2 border-t border-[var(--cosmic-border)] space-y-3">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Observation Date/Time */}
            <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--cosmic-text-subtle)] text-[10px] mb-1">
                <Calendar className="w-3 h-3 text-[var(--cosmic-cyan)]" />
                <span>Date &amp; Time (UTC)</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-semibold">
                {observation.timestamp.replace('T', ' ').replace('Z', ' UTC')}
              </div>
              <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
                JD: {observation.julianDate.toFixed(4)} (Simulated)
              </div>
            </div>

            {/* 2. Pointing Coordinates & FOV */}
            <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--cosmic-text-subtle)] text-[10px] mb-1">
                <Crosshair className="w-3 h-3 text-[var(--cosmic-cyan)]" />
                <span>Celestial Coordinates (ICRS / J2000)</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-semibold">
                RA {observation.centerRa.toFixed(4)}°, Dec {observation.centerDec >= 0 ? '+' : ''}{observation.centerDec.toFixed(4)}°
              </div>
              <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
                FOV: {(observation.fovDeg * 60).toFixed(0)}′ ({(observation.fovDeg).toFixed(2)}°)
              </div>
            </div>

            {/* 3. Observation Identifier */}
            <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--cosmic-text-subtle)] text-[10px] mb-1">
                <Info className="w-3 h-3 text-[var(--cosmic-cyan)]" />
                <span>Observation Identifier</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-semibold truncate" title={observation.id}>
                {observation.id}
              </div>
              <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
                Target: {observation.targetRegion}
              </div>
            </div>

            {/* 4. Detector Subsystem Assignment */}
            <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--cosmic-text-subtle)] text-[10px] mb-1">
                <Cpu className="w-3 h-3 text-amber-500" />
                <span>Detector Subsystem</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-semibold truncate" title={observation.detector?.focalPlaneArray || 'Focal Plane Array'}>
                {observation.detector?.focalPlaneArray || 'Cryogenic H2RG Array'}
              </div>
              <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
                Array: {observation.fitsHeaders?.DETNAME || 'SCA-10x'} (See mission spec for full specs)
              </div>
            </div>

            {/* 5. Spectral Band & Channels */}
            <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--cosmic-text-subtle)] text-[10px] mb-1">
                <Layers className="w-3 h-3 text-[var(--cosmic-violet)]" />
                <span>Spectral Band &amp; Channels</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-semibold truncate" title={observation.filterBand}>
                {observation.filterBand}
              </div>
              <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
                {observation.spectralChannels ? (
                  <span>Channels: <strong className="text-[var(--cosmic-text)]">{observation.spectralChannels}</strong></span>
                ) : (
                  <span>Broadband filter cutout</span>
                )}
                {' · '}Exp: {observation.exposureSec}s
              </div>
            </div>

            {/* 6. Pipeline & Quality Flags */}
            <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <div className="flex items-center gap-1 text-[var(--cosmic-text-subtle)] text-[10px] mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Pipeline Status &amp; Quality Flags</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-semibold flex items-center justify-between">
                <span>{observation.status}</span>
                <span className="text-amber-500 text-[10px] font-normal">[Illustrative Mock Data]</span>
              </div>
              <div className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5">
                Simulated Pattern: {observation.simulatedTilePattern} (No flight telemetry)
              </div>
            </div>
          </div>

          {/* 7. Data Provenance Banner */}
          <div className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] text-[10px] font-medium">
                <Database className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
                <span>Data Provenance</span>
              </div>
              <div className="text-[var(--cosmic-text)] font-medium text-xs mt-0.5">
                Synthetic test data — not retrieved from IRSA.
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 self-start sm:self-auto shrink-0">
              SIMULATED DATA
            </span>
          </div>

          {/* 8. FITS Header Keywords Collapsible Preview */}
          {observation.fitsHeaders && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowFits(!showFits)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[11px] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
                  <span>Primary FITS Header Keywords (Synthetic Test Record)</span>
                </span>
                {showFits ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFits && (
                <div className="mt-2 p-3 rounded-lg bg-black/40 border border-[var(--cosmic-border)] text-[10px] text-[var(--cosmic-text-muted)] space-y-1 overflow-x-auto max-h-48">
                  <div className="text-[var(--cosmic-text-subtle)] mb-1 font-semibold">
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
      )}
    </div>
  );
};

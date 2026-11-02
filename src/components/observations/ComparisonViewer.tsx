import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ObservationMetadata,
  DifferenceMetric,
  EpochId
} from '../../types/observation';
import { useSettings } from '../../context/SettingsContext';
import {
  Columns,
  Layers,
  Play,
  Pause,
  GripVertical,
  Eye,
  Minus,
  Plus,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ObservationImageViewport } from './ObservationImageViewport';
import { EpochPlaybackControls, PlaybackSpeed } from './EpochPlaybackControls';
import { SpectralSelector } from './SpectralSelector';
import { ObservationMetadataPanel } from './ObservationMetadataPanel';

export type ComparisonMode = 'single' | 'blink' | 'side-by-side' | 'swipe' | 'difference';

interface ComparisonViewerProps {
  observations?: ObservationMetadata[];
  obsA: ObservationMetadata;
  obsB: ObservationMetadata;
  differenceMetrics?: DifferenceMetric[];
  onSelectCandidate?: (candidateId: string) => void;
  targetName?: string;
  onSelectEpochPair?: (epochA: EpochId, epochB: EpochId) => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  observations: initialObsList,
  obsA: propObsA,
  obsB: propObsB,
  differenceMetrics = [],
  onSelectCandidate,
  targetName,
  onSelectEpochPair
}) => {
  const { settings } = useSettings();

  // Consolidate available observation sequence (variable length)
  const observations = initialObsList && initialObsList.length > 0
    ? initialObsList
    : [propObsA, propObsB];

  // Primary mode selection: 'single' | 'blink' | 'side-by-side' | 'swipe' | 'difference'
  const [mode, setMode] = useState<ComparisonMode>('blink');

  // Multi-epoch chronological playback state
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Epoch pair selection for comparison modes (A vs B)
  const [selectedEpochA, setSelectedEpochA] = useState<EpochId>(propObsA.epoch);
  const [selectedEpochB, setSelectedEpochB] = useState<EpochId>(propObsB.epoch);

  // Swipe mode state
  const [swipePercent, setSwipePercent] = useState<number>(50);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Blink comparator mode state
  const [isBlinking, setIsBlinking] = useState<boolean>(true);
  const [activeBlinkEpoch, setActiveBlinkEpoch] = useState<'A' | 'B'>('A');
  const [blinkSpeedMs, setBlinkSpeedMs] = useState<number>(settings.defaultBlinkIntervalMs || 600);

  // Collapsible panels
  const [showSpectralSelector, setShowSpectralSelector] = useState<boolean>(false);
  const [showAstrometricTable, setShowAstrometricTable] = useState<boolean>(false);

  // Resolve current active observation based on playback or pair
  const currentTimelineObs = observations[playbackIndex] || observations[0];
  const activeObsA = observations.find(o => o.epoch === selectedEpochA) || propObsA;
  const activeObsB = observations.find(o => o.epoch === selectedEpochB) || propObsB;

  // Sync epoch changes with parent if provided
  const handleEpochAChange = (epoch: EpochId) => {
    setSelectedEpochA(epoch);
    onSelectEpochPair?.(epoch, selectedEpochB);
  };

  const handleEpochBChange = (epoch: EpochId) => {
    setSelectedEpochB(epoch);
    onSelectEpochPair?.(selectedEpochA, epoch);
  };

  // Blink interval timer with cleanup
  useEffect(() => {
    if (mode !== 'blink' || !isBlinking) return;

    const interval = window.setInterval(() => {
      setActiveBlinkEpoch(prev => (prev === 'A' ? 'B' : 'A'));
    }, blinkSpeedMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [mode, isBlinking, blinkSpeedMs]);

  // Clean up playback when leaving page or switching away from single playback mode
  useEffect(() => {
    return () => {
      setIsPlaying(false);
    };
  }, []);

  // Robust pointer-based swipe divider drag (works on mouse and touch)
  const updateSwipe = (clientX: number, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setSwipePercent(pct);
  };

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSwipe(e.clientX, e.currentTarget);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    updateSwipe(e.clientX, e.currentTarget);
  }, []);

  const modes: { id: ComparisonMode; label: string; icon: React.ReactNode }[] = [
    { id: 'single', label: 'Timeline Playback', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'blink', label: 'Blink Comparator', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'side-by-side', label: 'Side by Side', icon: <Columns className="w-3.5 h-3.5" /> },
    { id: 'swipe', label: 'Swipe Reveal', icon: <GripVertical className="w-3.5 h-3.5" /> },
    { id: 'difference', label: 'Simulated Difference', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Selector & Configuration Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-3 shadow-sm">
        {/* Comparison Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[var(--cosmic-surface-subtle)] p-1 rounded-lg border border-[var(--cosmic-border)] overflow-x-auto max-w-full">
          {modes.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                mode === m.id
                  ? 'bg-[var(--cosmic-surface-hover)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30 font-bold shadow-sm'
                  : 'text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)]'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Mode-Specific Sub-controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pair Selectors for Comparison Modes */}
          {mode !== 'single' && (
            <div className="flex items-center gap-2 bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] rounded-lg px-2.5 py-1 text-xs font-mono">
              <span className="text-[10px] text-[var(--cosmic-text-subtle)]">Compare:</span>
              <select
                value={selectedEpochA}
                onChange={e => handleEpochAChange(e.target.value as EpochId)}
                className="bg-transparent text-[var(--cosmic-cyan)] font-bold focus:outline-none cursor-pointer"
                aria-label="Select Epoch A"
              >
                {observations.map(obs => (
                  <option key={obs.id} value={obs.epoch} className="bg-[var(--cosmic-surface)] text-[var(--cosmic-text)]">
                    Epoch {obs.epoch} ({obs.timestamp.substring(0, 10)})
                  </option>
                ))}
              </select>
              <span className="text-[var(--cosmic-text-muted)]">vs</span>
              <select
                value={selectedEpochB}
                onChange={e => handleEpochBChange(e.target.value as EpochId)}
                className="bg-transparent text-[var(--cosmic-violet)] font-bold focus:outline-none cursor-pointer"
                aria-label="Select Epoch B"
              >
                {observations.map(obs => (
                  <option key={obs.id} value={obs.epoch} className="bg-[var(--cosmic-surface)] text-[var(--cosmic-text)]">
                    Epoch {obs.epoch} ({obs.timestamp.substring(0, 10)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Blink Mode Controls */}
          {mode === 'blink' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBlinking(!isBlinking)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] text-xs font-mono text-[var(--cosmic-text)] border border-[var(--cosmic-border)] transition-colors cursor-pointer"
              >
                {isBlinking
                  ? <Pause className="w-3.5 h-3.5 text-amber-400" />
                  : <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                }
                <span>{isBlinking ? 'Pause Blink' : 'Resume Blink'}</span>
              </button>

              <div className="flex items-center gap-1.5 border border-[var(--cosmic-border)] rounded-lg bg-[var(--cosmic-surface-subtle)] px-2 py-1">
                <button
                  type="button"
                  onClick={() => setBlinkSpeedMs(v => Math.min(1500, v + 100))}
                  className="text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] cursor-pointer"
                  title="Slower Blink"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-mono text-[var(--cosmic-text)] w-12 text-center">{blinkSpeedMs}ms</span>
                <button
                  type="button"
                  onClick={() => setBlinkSpeedMs(v => Math.max(100, v - 100))}
                  className="text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] cursor-pointer"
                  title="Faster Blink"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <span className={`text-[10px] font-mono px-2 py-1 rounded border font-semibold ${
                activeBlinkEpoch === 'A'
                  ? 'text-[var(--cosmic-cyan)] border-[var(--cosmic-cyan)]/40 bg-[var(--cosmic-cyan-subtle)]'
                  : 'text-[var(--cosmic-violet)] border-[var(--cosmic-violet)]/40 bg-[var(--cosmic-violet-subtle)]'
              }`}>
                Active: Epoch {activeBlinkEpoch === 'A' ? activeObsA.epoch : activeObsB.epoch}
              </span>
            </div>
          )}

          {/* Swipe Hint */}
          {mode === 'swipe' && (
            <span className="text-[10px] font-mono text-[var(--cosmic-text-muted)] flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
              <span>Drag divider: Left is {activeObsA.epoch}, Right is {activeObsB.epoch}</span>
            </span>
          )}

          {/* Difference Label */}
          {mode === 'difference' && (
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
              SIMULATED DIFFERENCE · NOT A SCIENTIFIC CALCULATION
            </span>
          )}

          {/* Toggle Spectral Selector */}
          <button
            type="button"
            onClick={() => setShowSpectralSelector(!showSpectralSelector)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              showSpectralSelector
                ? 'bg-[var(--cosmic-violet-subtle)] text-[var(--cosmic-violet)] border-[var(--cosmic-violet)] font-bold'
                : 'bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border-[var(--cosmic-border)] hover:text-[var(--cosmic-text)]'
            }`}
            title="Toggle SPHEREx Spectral Band & Channel Selector"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Spectral</span>
          </button>
        </div>
      </div>

      {/* Optional Spectral Selector Drawer */}
      {showSpectralSelector && (
        <SpectralSelector
          currentObservation={mode === 'single' ? currentTimelineObs : activeObsA}
        />
      )}

      {/* Mode 1: Single Viewport with Chronological Playback Controls */}
      {mode === 'single' && (
        <div className="space-y-3">
          <div className="h-[480px]">
            <ObservationImageViewport
              observation={currentTimelineObs}
              title={targetName ? `${targetName} · Epoch ${currentTimelineObs.epoch}` : `Sequence Viewport · Epoch ${currentTimelineObs.epoch}`}
              badgeAccent="#38BDF8"
            />
          </div>

          <EpochPlaybackControls
            observations={observations}
            currentIndex={playbackIndex}
            onSelectIndex={setPlaybackIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            speed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
            isLooping={isLooping}
            onToggleLoop={() => setIsLooping(!isLooping)}
          />
        </div>
      )}

      {/* Mode 2: Blink Comparator Viewport */}
      {mode === 'blink' && (
        <div className="h-[480px]">
          {activeBlinkEpoch === 'A' ? (
            <ObservationImageViewport
              observation={activeObsA}
              title={`Blink Frame A · Epoch ${activeObsA.epoch}`}
              badgeAccent="#38BDF8"
            />
          ) : (
            <ObservationImageViewport
              observation={activeObsB}
              title={`Blink Frame B · Epoch ${activeObsB.epoch}`}
              badgeAccent="#818CF8"
            />
          )}
        </div>
      )}

      {/* Mode 3: Side-by-Side Dual Viewport */}
      {mode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[480px]">
          <ObservationImageViewport
            observation={activeObsA}
            title={`Epoch ${activeObsA.epoch} (A)`}
            badgeAccent="#38BDF8"
          />
          <ObservationImageViewport
            observation={activeObsB}
            title={`Epoch ${activeObsB.epoch} (B)`}
            badgeAccent="#818CF8"
          />
        </div>
      )}

      {/* Mode 4: Swipe Reveal Draggable Viewport */}
      {mode === 'swipe' && (
        <div
          ref={swipeContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="relative w-full h-[480px] cursor-ew-resize touch-none overflow-hidden rounded-xl border border-[var(--cosmic-border)] bg-[#050810]"
          style={{ userSelect: 'none' }}
        >
          {/* Background Layer: Epoch B */}
          <div className="absolute inset-0">
            <ObservationImageViewport
              observation={activeObsB}
              title={`Observation B · Epoch ${activeObsB.epoch}`}
              badgeAccent="#818CF8"
            />
          </div>

          {/* Foreground Layer: Epoch A with horizontal clipPath */}
          <div
            className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - swipePercent}% 0 0)` }}
          >
            <ObservationImageViewport
              observation={activeObsA}
              title={`Observation A · Epoch ${activeObsA.epoch}`}
              badgeAccent="#38BDF8"
            />
          </div>

          {/* Draggable Divider Handle */}
          <div
            className="absolute inset-y-0 z-20 flex items-center justify-center pointer-events-none"
            style={{ left: `${swipePercent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-0.5 h-full bg-white/40 shadow-lg" />
            <div className="absolute w-8 h-8 rounded-full bg-[#050810] border-2 border-[var(--cosmic-cyan)] flex items-center justify-center shadow-2xl">
              <GripVertical className="w-4 h-4 text-[var(--cosmic-cyan)]" />
            </div>
          </div>
        </div>
      )}

      {/* Mode 5: Difference Viewport */}
      {mode === 'difference' && (
        <div className="h-[480px]">
          <ObservationImageViewport
            observation={activeObsB}
            title={`Simulated Difference (${activeObsB.epoch} − ${activeObsA.epoch})`}
            badgeAccent="#F43F5E"
            showDifferenceOverlay={true}
          />
        </div>
      )}

      {/* Observation Metadata & Provenance Panel */}
      <ObservationMetadataPanel
        observation={mode === 'single' ? currentTimelineObs : activeObsA}
        isOpenDefault={false}
      />

      {/* Collapsible Astrometric Candidate Motion Table */}
      {differenceMetrics.length > 0 && (
        <div className="obs-card border-[var(--cosmic-border)] bg-[var(--cosmic-surface)] rounded-xl overflow-hidden text-xs font-mono">
          <button
            type="button"
            onClick={() => setShowAstrometricTable(!showAstrometricTable)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--cosmic-surface-hover)] transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--cosmic-text)]">
                Astrometric Motion Vectors ({activeObsA.epoch} vs {activeObsB.epoch})
              </span>
              <span className="text-[10px] text-[var(--cosmic-text-muted)]">
                {differenceMetrics.length} candidate shifts detected
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[var(--cosmic-text-subtle)] hover:text-[var(--cosmic-text)]">
              <span className="text-[10px]">{showAstrometricTable ? 'Hide Vectors' : 'Show Vectors'}</span>
              {showAstrometricTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showAstrometricTable && (
            <div className="overflow-x-auto border-t border-[var(--cosmic-border)]">
              <table className="w-full text-left">
                <thead className="bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border-b border-[var(--cosmic-border)] text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Candidate ID</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Displacement</th>
                    <th className="py-2.5 px-4">Flux Δ</th>
                    <th className="py-2.5 px-4">Significance</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--cosmic-border)]">
                  {differenceMetrics.map(item => (
                    <tr key={item.candidateId} className="hover:bg-[var(--cosmic-surface-hover)] transition-colors">
                      <td className="py-2.5 px-4 text-[var(--cosmic-cyan)] font-semibold">{item.candidateId}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          item.apparentChange === 'MOTION_DETECTED'
                            ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)]'
                            : item.apparentChange === 'FLUX_VARIABILITY'
                            ? 'bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)]'
                            : 'bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)]'
                        }`}>
                          {item.apparentChange.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[var(--cosmic-text)]">{item.displacementArcsec.toFixed(1)}″</td>
                      <td className="py-2.5 px-4 text-[var(--cosmic-text-muted)]">
                        {item.fluxDifferencePercent >= 0 ? '+' : ''}{item.fluxDifferencePercent}%
                      </td>
                      <td className="py-2.5 px-4 text-[var(--cosmic-violet)] font-semibold">{item.significanceSigma.toFixed(1)}σ</td>
                      <td className="py-2.5 px-4 text-[var(--cosmic-text-muted)]">{item.reviewStatus}</td>
                      <td className="py-2.5 px-4 text-right">
                        {onSelectCandidate && (
                          <button
                            type="button"
                            onClick={() => onSelectCandidate(item.candidateId)}
                            className="px-2 py-0.5 rounded text-[10px] text-[var(--cosmic-cyan)] hover:bg-[var(--cosmic-cyan-subtle)] border border-transparent hover:border-[var(--cosmic-cyan)]/30 transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

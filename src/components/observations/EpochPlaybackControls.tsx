import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Gauge
} from 'lucide-react';
import { ObservationMetadata } from '../../types/observation';

export type PlaybackSpeed = 0.5 | 1 | 2;

interface EpochPlaybackControlsProps {
  observations: ObservationMetadata[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: PlaybackSpeed;
  onChangeSpeed: (speed: PlaybackSpeed) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
}

export const EpochPlaybackControls: React.FC<EpochPlaybackControlsProps> = ({
  observations,
  currentIndex,
  onSelectIndex,
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  isLooping,
  onToggleLoop
}) => {
  const timerRef = useRef<number | null>(null);

  // Playback timer interval based on speed: 1x = 1000ms, 0.5x = 2000ms, 2x = 500ms
  const intervalMs = Math.round(1000 / speed);

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Chronological playback cycle
  useEffect(() => {
    if (!isPlaying || observations.length === 0) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      const cur = currentIndexRef.current;
      if (cur + 1 < observations.length) {
        onSelectIndex(cur + 1);
      } else if (isLooping) {
        onSelectIndex(0);
      } else {
        onTogglePlay();
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, observations.length, intervalMs, isLooping, onSelectIndex, onTogglePlay]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    } else if (isLooping) {
      onSelectIndex(observations.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < observations.length) {
      onSelectIndex(currentIndex + 1);
    } else if (isLooping) {
      onSelectIndex(0);
    }
  };

  const currentObs = observations[currentIndex];
  if (!currentObs) return null;

  return (
    <div className="obs-card p-3 sm:p-4 border-[var(--cosmic-border)] bg-[var(--cosmic-surface)] text-xs font-mono">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Playback transport buttons & Status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Epoch */}
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[var(--cosmic-text)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Epoch"
            aria-label="Previous Epoch"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-[var(--cosmic-cyan)] text-slate-950 border-[var(--cosmic-cyan)] hover:bg-[var(--cosmic-cyan)]/90 shadow-sm'
            }`}
            title={isPlaying ? 'Pause chronological playback' : 'Start chronological epoch playback'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Sequence</span>
              </>
            )}
          </button>

          {/* Next Epoch */}
          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[var(--cosmic-text)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Epoch"
            aria-label="Next Epoch"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Loop toggle */}
          <button
            type="button"
            onClick={onToggleLoop}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
              isLooping
                ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border-[var(--cosmic-cyan)]/40 font-semibold'
                : 'bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border-[var(--cosmic-border)] hover:text-[var(--cosmic-text)]'
            }`}
            title={isLooping ? 'Looping enabled: sequence restarts at T1' : 'Looping disabled: stops at end'}
          >
            <Repeat className="w-3 h-3" />
            <span>Loop: {isLooping ? 'ON' : 'OFF'}</span>
          </button>

          {/* Playback speed selector */}
          <div className="flex items-center gap-1 bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] rounded-lg p-0.5">
            <span className="px-1.5 text-[10px] text-[var(--cosmic-text-subtle)] flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              Speed
            </span>
            {([0.5, 1, 2] as PlaybackSpeed[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-[var(--cosmic-cyan)] text-slate-950 font-bold'
                    : 'text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Epoch position indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--cosmic-text-muted)]">
            Viewing: <strong className="text-[var(--cosmic-cyan)]">{currentObs.epoch}</strong>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-subtle)] border border-[var(--cosmic-border)]">
            Epoch {currentIndex + 1} of {observations.length}
          </span>
          <span className="text-[10px] text-[var(--cosmic-text-subtle)] hidden lg:inline">
            ({currentObs.timestamp.substring(0, 10)})
          </span>
        </div>
      </div>

      {/* Timeline Scrubber Slider */}
      <div className="mt-3 pt-3 border-t border-[var(--cosmic-border)] space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-[var(--cosmic-text-muted)]">
          <span>T1 (Initial Survey)</span>
          <span className="text-[var(--cosmic-cyan)] font-semibold">
            Timeline Scrubber: Epoch {currentObs.epoch} ({currentObs.timestamp.replace('T', ' ').replace('Z', ' UTC')})
          </span>
          <span>T{observations.length} (Latest Baseline)</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, observations.length - 1)}
            value={currentIndex}
            onChange={e => onSelectIndex(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--cosmic-cyan)] cursor-pointer h-2 bg-[var(--cosmic-surface-subtle)] rounded-lg"
            aria-label="Observation timeline epoch slider"
          />
        </div>

        {/* Epoch Ticks Bar */}
        <div className="flex justify-between px-1 text-[10px] font-mono text-[var(--cosmic-text-subtle)]">
          {observations.map((obs, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={obs.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`flex flex-col items-center transition-colors cursor-pointer ${
                  isSelected ? 'text-[var(--cosmic-cyan)] font-bold' : 'hover:text-[var(--cosmic-text)]'
                }`}
              >
                <span>{obs.epoch}</span>
                <span className="text-[8px] opacity-70 hidden sm:inline">{obs.id.split('-').pop()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

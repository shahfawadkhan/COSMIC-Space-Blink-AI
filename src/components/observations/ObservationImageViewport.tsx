import React, { useState, useRef, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Move,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ObservationMetadata } from '../../types/observation';

interface ObservationImageViewportProps {
  observation: ObservationMetadata;
  title?: string;
  badgeAccent?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  showDifferenceOverlay?: boolean;
}

// Fixed stars in simulated cutout field
const STATIC_STARS = [
  { x: 120, y: 80, r: 2.2, c: 'rgba(255, 255, 255, 0.85)' },
  { x: 280, y: 140, r: 3.5, c: 'rgba(255, 255, 255, 0.95)' },
  { x: 420, y: 65, r: 1.8, c: 'rgba(202, 224, 255, 0.75)' },
  { x: 80, y: 290, r: 2.8, c: 'rgba(255, 244, 232, 0.80)' },
  { x: 380, y: 320, r: 2.0, c: 'rgba(255, 255, 255, 0.70)' },
  { x: 220, y: 260, r: 1.5, c: 'rgba(255, 210, 161, 0.65)' },
  { x: 490, y: 210, r: 2.4, c: 'rgba(255, 255, 255, 0.80)' },
  { x: 330, y: 185, r: 1.2, c: 'rgba(200, 220, 255, 0.60)' },
  { x: 160, y: 340, r: 1.8, c: 'rgba(255, 255, 255, 0.70)' },
  { x: 450, y: 290, r: 1.0, c: 'rgba(255, 230, 200, 0.55)' },
];

export const ObservationImageViewport: React.FC<ObservationImageViewportProps> = ({
  observation,
  title,
  badgeAccent = '#38BDF8',
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  showDifferenceOverlay = false
}) => {
  // Pan and Zoom state
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Pan event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Primary button only
    setIsPanning(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy
    });
  }, [isPanning]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  }, [isPanning]);

  // Candidate motion position based on epoch
  const getCandidatePosition = (epoch: string) => {
    switch (epoch) {
      case 'T1': return { x: 210, y: 170 };
      case 'T2': return { x: 232, y: 180 };
      case 'T3': return { x: 254, y: 190 };
      case 'T4': return { x: 275, y: 200 };
      default: return { x: 210, y: 170 };
    }
  };

  const candidatePos = getCandidatePosition(observation.epoch);

  if (isError) {
    return (
      <div className="relative w-full h-full min-h-[380px] bg-[#050810] flex flex-col items-center justify-center p-6 text-center text-xs font-mono border border-rose-500/30 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
        <h4 className="font-bold text-rose-400 text-sm mb-1">Observation Cutout Load Failed</h4>
        <p className="text-rose-500/80 max-w-sm mb-4">
          {errorMessage || 'Unable to retrieve synthetic FITS cutout slice for this observation epoch.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Retry Cutout Fetch
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full min-h-[400px] bg-[#050810] overflow-hidden select-none rounded-xl border border-[var(--cosmic-border)] ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-[#050810]/80 backdrop-blur-sm flex flex-col items-center justify-center text-xs font-mono">
          <div className="w-6 h-6 border-2 border-[var(--cosmic-cyan)] border-t-transparent rounded-full animate-spin mb-2" />
          <span className="text-[var(--cosmic-text)]">Rendering Simulated Observation…</span>
        </div>
      )}

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Top Left HUD: Epoch, Title, Timestamp */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: badgeAccent }} />
          <span className="font-bold">{title || `Epoch ${observation.epoch}`}</span>
          <span className="text-white/50">· {observation.filterBand.split(' ')[0]}</span>
          <span className="text-white/40 hidden sm:inline">({observation.id})</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[9px] font-mono text-white/70 self-start">
          {observation.timestamp.replace('T', ' ').replace('Z', ' UTC')}
        </div>
      </div>

      {/* Top Right HUD: Watermark and Zoom Indicator */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 pointer-events-none">
        {/* MANDATORY SIMULATED DATA WATERMARK */}
        <div className="px-2 py-0.5 rounded bg-amber-500/25 border border-amber-500/50 text-[9px] font-mono font-bold text-amber-400 shadow-md">
          SIMULATED DATA
        </div>
        <div className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-[9px] font-mono text-white/80">
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Bottom Left HUD: Pointing RA & Dec, FOV */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none space-y-1">
        <div className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/85 flex items-center gap-2">
          <span>RA {observation.centerRa.toFixed(4)}°</span>
          <span className="text-white/30">|</span>
          <span>Dec {observation.centerDec >= 0 ? '+' : ''}{observation.centerDec.toFixed(4)}°</span>
          <span className="text-white/30">|</span>
          <span className="text-[var(--cosmic-cyan)]">FOV {(observation.fovDeg * 60).toFixed(0)}′</span>
        </div>
        <div className="text-[9px] font-mono text-white/40 px-1">
          Synthetic test cutout · Not retrieved from IRSA
        </div>
      </div>

      {/* Bottom Right HUD: Interactive Zoom and Pan Toolbar */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-1 shadow-lg">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Zoom In (+25%)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out (-25%)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono"
          title="Reset Zoom & Pan (100%)"
          aria-label="Reset Zoom"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">1x</span>
        </button>
        <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
        <div className="p-1.5 text-white/40" title="Click and drag to pan">
          <Move className="w-3 h-3" />
        </div>
      </div>

      {/* Primary SVG Image Plane (with Zoom & Pan transform) */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 560 380" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={`starGlow-${observation.epoch}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor="#B0D4FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#050810" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`candGlow-${observation.epoch}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={badgeAccent} stopOpacity="0.75" />
              <stop offset="100%" stopColor="#050810" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Celestial Astrometric Coordinate Grid Lines */}
          <line x1="0" y1="190" x2="560" y2="190" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
          <line x1="280" y1="0" x2="280" y2="380" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
          <line x1="140" y1="0" x2="140" y2="380" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="420" y1="0" x2="420" y2="380" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="95" x2="560" y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="285" x2="560" y2="285" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Static Background Stars */}
          {STATIC_STARS.map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r={s.r * 2.5} fill={`url(#starGlow-${observation.epoch})`} opacity="0.3" />
              <circle cx={s.x} cy={s.y} r={s.r} fill={s.c} />
            </g>
          ))}

          {/* Moving Candidate / Target Reticle */}
          <g>
            <circle cx={candidatePos.x} cy={candidatePos.y} r="20" fill={`url(#candGlow-${observation.epoch})`} opacity="0.6" />
            <circle cx={candidatePos.x} cy={candidatePos.y} r="3.5" fill="#FFFFFF" />
            {/* Precision targeting reticle */}
            <circle cx={candidatePos.x} cy={candidatePos.y} r="12" stroke={badgeAccent} strokeWidth="1" fill="none" />
            <line x1={candidatePos.x} y1={candidatePos.y - 17} x2={candidatePos.x} y2={candidatePos.y - 14} stroke={badgeAccent} strokeWidth="1.5" />
            <line x1={candidatePos.x} y1={candidatePos.y + 14} x2={candidatePos.x} y2={candidatePos.y + 17} stroke={badgeAccent} strokeWidth="1.5" />
            <line x1={candidatePos.x - 17} y1={candidatePos.y} x2={candidatePos.x - 14} y2={candidatePos.y} stroke={badgeAccent} strokeWidth="1.5" />
            <line x1={candidatePos.x + 14} y1={candidatePos.y} x2={candidatePos.x + 17} y2={candidatePos.y} stroke={badgeAccent} strokeWidth="1.5" />
            {/* Position label */}
            <text x={candidatePos.x + 16} y={candidatePos.y - 10} fill={badgeAccent} fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
              {observation.targetRegion.split(' ')[0]} ({observation.epoch})
            </text>
            <text x={candidatePos.x + 16} y={candidatePos.y + 2} fill="rgba(255,255,255,0.6)" fontSize="7.5" fontFamily="JetBrains Mono, monospace">
              Δ pos: [{candidatePos.x}, {candidatePos.y}]
            </text>
          </g>

          {/* Difference Overlay (when Difference mode is enabled) */}
          {showDifferenceOverlay && (
            <g>
              <rect x="0" y="0" width="560" height="380" fill="rgba(0,0,0,0.3)" />
              {/* Negative residual at T1 */}
              <circle cx="210" cy="170" r="18" fill="rgba(2,132,199,0.55)" />
              <circle cx="210" cy="170" r="9" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" fill="none" />
              <text x="145" y="195" fill="#38BDF8" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                − T1 Residual
              </text>
              {/* Motion vector arrow */}
              <line x1="222" y1="175" x2="265" y2="195" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Positive residual at T4 */}
              <circle cx="275" cy="200" r="18" fill="rgba(244,63,94,0.55)" />
              <circle cx="275" cy="200" r="9" stroke="#F43F5E" strokeWidth="1.2" fill="none" />
              <text x="288" y="190" fill="#F43F5E" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                + T4 Residual
              </text>
              {/* Difference Banner */}
              <rect x="155" y="240" width="250" height="36" rx="4" fill="rgba(0,0,0,0.85)" stroke="#F59E0B" strokeWidth="1" />
              <text x="170" y="255" fill="#F59E0B" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                SIMULATED DIFFERENCE (T4 − T1)
              </text>
              <text x="170" y="268" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">
                Illustrative subtraction model · Not flight photometry
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

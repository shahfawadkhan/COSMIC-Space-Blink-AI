import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { CandidateRecord } from '../../types/candidate';
import { EpochId } from '../../types/observation';
import { SkyControls } from './SkyControls';
import { SkyLegend } from './SkyLegend';
import { CandidateDrawer } from './CandidateDrawer';
import { formatCoordinates } from '../../lib/astroUtils';
import { useSettings } from '../../context/SettingsContext';

interface SkyFieldViewerProps {
  candidates: CandidateRecord[];
  selectedEpoch?: EpochId;
  /** Deprecated: viewer manages selection internally. Retained for future backend wiring only. */
  selectedCandidateId?: string | null;
  /** Called when the user selects or deselects a candidate. Null means deselected. */
  onSelectCandidate?: (candidate: CandidateRecord | null) => void;
  heightClass?: string;
  showDrawer?: boolean;
}

// Generate realistic deterministic background stars
function generateDeterministicStars(count: number, centerRa: number, centerDec: number, fovDeg: number) {
  const stars = [];
  let seed = 42;
  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 0; i < count; i++) {
    const raOffset = (random() - 0.5) * fovDeg * 1.5;
    const decOffset = (random() - 0.5) * fovDeg * 1.5;
    const mag = 8 + random() * 10; // magnitude 8 to 18
    const temp = 3000 + random() * 7000; // Kelvin
    
    // Slight color tint based on temperature (B-V color index)
    let color = '#FFFFFF';
    if (temp < 4000) color = '#FFD2A1'; // Red/Orange dwarf
    else if (temp < 6000) color = '#FFF4E8'; // Yellow/G-type
    else if (temp > 8000) color = '#CAE0FF'; // Blue/white

    stars.push({
      ra: centerRa + raOffset,
      dec: centerDec + decOffset,
      mag,
      radius: Math.max(0.6, (18 - mag) * 0.28),
      alpha: Math.min(1, Math.max(0.15, (18 - mag) * 0.1)),
      color
    });
  }
  return stars;
}

export const SkyFieldViewer: React.FC<SkyFieldViewerProps> = ({
  candidates,
  selectedEpoch = 'T1',
  selectedCandidateId = null,
  onSelectCandidate,
  heightClass = 'h-[520px]',
  showDrawer = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  // Field center: North Ecliptic Pole deep calibration tile
  const centerRa = 270.284;
  const centerDec = 66.571;
  const baseFovDeg = 0.55;

  // View state: pan & zoom
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cursor coordinates & hover
  const [cursorCoords, setCursorCoords] = useState<{ ra: number; dec: number }>({ ra: centerRa, dec: centerDec });
  const [hoveredCandidate, setHoveredCandidate] = useState<CandidateRecord | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<CandidateRecord | null>(null);

  // Track whether the pointer actually moved during a drag so we don't
  // treat a pan gesture as a "click on empty sky"
  const hasDraggedRef = useRef<boolean>(false);

  // Layer toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCandidates, setShowCandidates] = useState<boolean>(true);
  const [showTracks, setShowTracks] = useState<boolean>(true);
  const [showSources, setShowSources] = useState<boolean>(true);

  // Background stars
  const backgroundStars = useMemo(() => {
    return generateDeterministicStars(350, centerRa, centerDec, baseFovDeg);
  }, []);

  // Escape key closes drawer and clears selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCandidate(null);
        if (onSelectCandidate) onSelectCandidate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectCandidate]);

  // When the filtered candidate list changes, if the selected candidate is no longer present, clear it
  useEffect(() => {
    if (activeCandidate && !candidates.find(c => c.id === activeCandidate.id)) {
      setActiveCandidate(null);
    }
  }, [candidates, activeCandidate]);

  // Coordinate projection helper: converts celestial (RA, Dec) to Canvas pixel (x, y)
  const celestialToCanvas = useCallback((ra: number, dec: number, width: number, height: number) => {
    const scale = (Math.min(width, height) / baseFovDeg) * zoom;
    const rad = Math.PI / 180;
    const cosDecCenter = Math.cos(centerDec * rad);

    // Astronomical convention: RA increases to the left (East is left)
    const deltaRa = (centerRa - ra) * cosDecCenter;
    const deltaDec = dec - centerDec;

    const x = width / 2 + deltaRa * scale + pan.x;
    const y = height / 2 - deltaDec * scale + pan.y;

    return { x, y };
  }, [zoom, pan, centerRa, centerDec, baseFovDeg]);

  // Inverse projection: Canvas pixel (x, y) to celestial (RA, Dec)
  const canvasToCelestial = useCallback((x: number, y: number, width: number, height: number) => {
    const scale = (Math.min(width, height) / baseFovDeg) * zoom;
    const rad = Math.PI / 180;
    const cosDecCenter = Math.cos(centerDec * rad);

    const deltaRa = (x - (width / 2 + pan.x)) / scale;
    const deltaDec = -(y - (height / 2 + pan.y)) / scale;

    const ra = centerRa - deltaRa / cosDecCenter;
    const dec = centerDec + deltaDec;

    return { ra, dec };
  }, [zoom, pan, centerRa, centerDec, baseFovDeg]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // 1. Clear background & draw subtle deep-space gradient
    ctx.fillStyle = '#070B14';
    ctx.fillRect(0, 0, width, height);

    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
    bgGrad.addColorStop(0, '#0B1226');
    bgGrad.addColorStop(0.5, '#080E1E');
    bgGrad.addColorStop(1, '#050810');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw subtle FOV boundary ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2 + pan.x, height / 2 + pan.y, (Math.min(width, height) * 0.44) * zoom, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(85, 214, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();

    // 3. Draw Celestial Coordinate Grid (RA and Dec lines)
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';

      // Dec lines (every 0.05 degrees)
      const decStep = 0.05;
      const startDec = Math.floor((centerDec - baseFovDeg) / decStep) * decStep;
      const endDec = Math.ceil((centerDec + baseFovDeg) / decStep) * decStep;

      for (let dec = startDec; dec <= endDec; dec += decStep) {
        const p1 = celestialToCanvas(centerRa - baseFovDeg * 1.5, dec, width, height);
        const p2 = celestialToCanvas(centerRa + baseFovDeg * 1.5, dec, width, height);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        if (p1.y > 20 && p1.y < height - 20) {
          ctx.fillText(`${dec.toFixed(2)}°`, 16, p1.y - 4);
        }
      }

      // RA lines (every 0.05 degrees)
      const raStep = 0.05;
      const startRa = Math.floor((centerRa - baseFovDeg) / raStep) * raStep;
      const endRa = Math.ceil((centerRa + baseFovDeg) / raStep) * raStep;

      for (let ra = startRa; ra <= endRa; ra += raStep) {
        const p1 = celestialToCanvas(ra, centerDec - baseFovDeg * 1.5, width, height);
        const p2 = celestialToCanvas(ra, centerDec + baseFovDeg * 1.5, width, height);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        if (p1.x > 30 && p1.x < width - 40) {
          ctx.fillText(`${ra.toFixed(2)}°`, p1.x + 4, height - 16);
        }
      }
      ctx.restore();
    }

    // 4. Draw Background Field Stars
    if (showSources) {
      ctx.save();
      for (const star of backgroundStars) {
        const pt = celestialToCanvas(star.ra, star.dec, width, height);
        if (pt.x < -10 || pt.x > width + 10 || pt.y < -10 || pt.y > height + 10) continue;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();

        // Subtle diffraction spike on bright stars (mag < 10)
        if (star.mag < 10.5) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.moveTo(pt.x - 5, pt.y);
          ctx.lineTo(pt.x + 5, pt.y);
          ctx.moveTo(pt.x, pt.y - 5);
          ctx.lineTo(pt.x, pt.y + 5);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 5. Draw Candidate Motion Tracks
    if (showTracks) {
      ctx.save();
      for (const cand of candidates) {
        if (!cand.epochsDetected || cand.epochsDetected.length < 2) continue;

        ctx.strokeStyle = cand.reviewStatus === 'Needs Review' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(85, 214, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        cand.epochsDetected.forEach((ep, idx) => {
          const pt = celestialToCanvas(ep.ra, ep.dec, width, height);
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // 6. Draw Candidate Markers
    if (showCandidates) {
      for (const cand of candidates) {
        // Resolve position based on selected epoch detection
        const epochDet = cand.epochsDetected.find(e => e.epoch === selectedEpoch) || cand.epochsDetected[0];
        const ra = epochDet ? epochDet.ra : cand.ra;
        const dec = epochDet ? epochDet.dec : cand.dec;
        const pt = celestialToCanvas(ra, dec, width, height);

        if (pt.x < -30 || pt.x > width + 30 || pt.y < -30 || pt.y > height + 30) continue;

        const isHovered = hoveredCandidate?.id === cand.id;
        const isSelected = activeCandidate?.id === cand.id;

        // Choose color palette based on status
        let mainColor = '#55D6FF';
        let glowColor = 'rgba(85, 214, 255, 0.25)';

        if (cand.reviewStatus === 'Needs Review') {
          mainColor = '#FBBF24';
          glowColor = 'rgba(251, 191, 36, 0.3)';
        } else if (cand.reviewStatus === 'Known Object Match') {
          mainColor = '#34D399';
          glowColor = 'rgba(52, 211, 153, 0.25)';
        } else if (cand.reviewStatus === 'Possible Artifact') {
          mainColor = '#F43F5E';
          glowColor = 'rgba(244, 63, 94, 0.3)';
        } else if (cand.reviewStatus === 'Archived') {
          mainColor = '#94A3B8';
          glowColor = 'rgba(148, 163, 184, 0.15)';
        }

        ctx.save();

        // Glow ring
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isSelected ? 18 : 14, 0, Math.PI * 2);
          ctx.fillStyle = glowColor;
          ctx.fill();
        }

        // Outer Reticle Ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 12 : 9, 0, Math.PI * 2);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.stroke();

        // Reticle Crosshairs
        const crosshairLen = isSelected ? 6 : 4;
        ctx.beginPath();
        // Top
        ctx.moveTo(pt.x, pt.y - (isSelected ? 14 : 11));
        ctx.lineTo(pt.x, pt.y - (isSelected ? 14 : 11) - crosshairLen);
        // Bottom
        ctx.moveTo(pt.x, pt.y + (isSelected ? 14 : 11));
        ctx.lineTo(pt.x, pt.y + (isSelected ? 14 : 11) + crosshairLen);
        // Left
        ctx.moveTo(pt.x - (isSelected ? 14 : 11), pt.y);
        ctx.lineTo(pt.x - (isSelected ? 14 : 11) - crosshairLen, pt.y);
        // Right
        ctx.moveTo(pt.x + (isSelected ? 14 : 11), pt.y);
        ctx.lineTo(pt.x + (isSelected ? 14 : 11) + crosshairLen, pt.y);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Label tag
        if (isSelected || isHovered || zoom > 1.4) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#F8FAFC';
          ctx.fillText(cand.id, pt.x + 14, pt.y - 8);

          if (isHovered || isSelected) {
            ctx.fillStyle = mainColor;
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillText(`${cand.apparentMotionArcsecPerHour.toFixed(2)} "/hr • ${cand.reviewStatus}`, pt.x + 14, pt.y + 6);
          }
        }

        ctx.restore();
      }
    }

    // 7. Reticle Center Crosshair for viewport center
    ctx.save();
    ctx.strokeStyle = 'rgba(85, 214, 255, 0.2)';
    ctx.lineWidth = 1;
    const cx = width / 2;
    const cy = height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
    ctx.restore();

  }, [
    zoom,
    pan,
    candidates,
    selectedEpoch,
    hoveredCandidate,
    activeCandidate,
    showGrid,
    showCandidates,
    showTracks,
    showSources,
    backgroundStars,
    celestialToCanvas
  ]);

  // Mouse & interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      hasDraggedRef.current = true;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Update celestial cursor coordinates
    const celestial = canvasToCelestial(mouseX, mouseY, rect.width, rect.height);
    setCursorCoords(celestial);

    // Hit test for candidate hover
    let found: CandidateRecord | null = null;
    for (const cand of candidates) {
      const epochDet = cand.epochsDetected.find(ep => ep.epoch === selectedEpoch) || cand.epochsDetected[0];
      const ra = epochDet ? epochDet.ra : cand.ra;
      const dec = epochDet ? epochDet.dec : cand.dec;
      const pt = celestialToCanvas(ra, dec, rect.width, rect.height);

      const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
      if (dist < 18) {
        found = cand;
        break;
      }
    }
    setHoveredCandidate(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore clicks that were actually the end of a pan drag
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    if (hoveredCandidate) {
      // Select or switch to the hovered candidate
      setActiveCandidate(hoveredCandidate);
      if (onSelectCandidate) onSelectCandidate(hoveredCandidate);
    } else {
      // Click on empty sky — close drawer and clear selection
      setActiveCandidate(null);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom(z => Math.max(0.6, Math.min(4.5, z * factor)));
  };

  const handleZoomIn = () => setZoom(z => Math.min(4.5, z * 1.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.6, z * 0.8));
  const handleReset = () => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
  };

  const { raStr, decStr } = formatCoordinates(cursorCoords.ra, cursorCoords.dec, settings.coordinateFormat);

  return (
    <div ref={containerRef} className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-[var(--cosmic-border)] bg-[#070B14] select-none shadow-xl`}>
      {/* Top Banner: Scientific Provenance Notice */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="px-2.5 py-1 rounded-md bg-[var(--cosmic-surface)]/95 backdrop-blur border border-[var(--cosmic-border)] text-[11px] font-mono text-[var(--cosmic-text)] flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--cosmic-cyan)]" />
          <span className="font-semibold">FIELD NEP-04</span>
          <span className="text-[var(--cosmic-text-muted)]">|</span>
          <span className="text-[var(--cosmic-cyan)] font-semibold">Epoch {selectedEpoch}</span>
        </div>
      </div>

      {/* Top Right: Viewport Controls */}
      <div className="absolute top-3 right-3 z-10">
        <SkyControls
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showCandidates={showCandidates}
          setShowCandidates={setShowCandidates}
          showTracks={showTracks}
          setShowTracks={setShowTracks}
          showSources={showSources}
          setShowSources={setShowSources}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </div>

      {/* Bottom Left: Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:block">
        <SkyLegend />
      </div>

      {/* Bottom Right: Cursor Coordinates Readout */}
      <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)]/95 backdrop-blur border border-[var(--cosmic-border)] text-[11px] font-mono text-[var(--cosmic-text-muted)] flex items-center gap-3 shadow-sm">
        <div>
          <span>RA:</span> <span className="text-[var(--cosmic-text)] font-semibold">{raStr}</span>
        </div>
        <div>
          <span>Dec:</span> <span className="text-[var(--cosmic-text)] font-semibold">{decStr}</span>
        </div>
        <div className="text-[var(--cosmic-cyan)] font-semibold border-l border-[var(--cosmic-border)] pl-3">
          {zoom.toFixed(1)}x
        </div>
      </div>

      {/* Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className={`w-full h-full cursor-${isDragging ? 'grabbing' : hoveredCandidate ? 'pointer' : 'crosshair'}`}
      />

      {/* Candidate Inspection Drawer */}
      {showDrawer && activeCandidate && (
        <CandidateDrawer
          candidate={activeCandidate}
          onClose={() => setActiveCandidate(null)}
        />
      )}
    </div>
  );
};

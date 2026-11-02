import React from 'react';
import { AlertTriangle, Info, Crosshair, TrendingUp } from 'lucide-react';
import { AstrometricAnalysisData } from '../../types/analysis';

interface AstrometricAnalysisProps {
  data: AstrometricAnalysisData | null;
  loading?: boolean;
}

function formatRA(deg: number): string {
  const h = Math.floor(deg / 15);
  const mFrac = (deg / 15 - h) * 60;
  const m = Math.floor(mFrac);
  const s = (mFrac - m) * 60;
  return `${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m ${s.toFixed(2).padStart(5,'0')}s`;
}

function formatDec(deg: number): string {
  const sign = deg < 0 ? '-' : '+';
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const mFrac = (abs - d) * 60;
  const m = Math.floor(mFrac);
  const s = (mFrac - m) * 60;
  return `${sign}${d.toString().padStart(2,'0')}° ${m.toString().padStart(2,'0')}' ${s.toFixed(1).padStart(4,'0')}"`;
}

const EPOCH_COLORS: Record<string, string> = {
  T1: '#38BDF8',
  T2: '#818CF8',
  T3: '#10B981',
  T4: '#F59E0B',
};

export const AstrometricAnalysis: React.FC<AstrometricAnalysisProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="obs-card p-6 flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-[var(--cosmic-cyan)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[var(--cosmic-text-muted)]">Loading astrometric data…</span>
      </div>
    );
  }
  if (!data || data.positions.length === 0) {
    return (
      <div className="obs-card p-8 flex flex-col items-center gap-3 text-center">
        <Crosshair className="w-8 h-8 text-[var(--cosmic-text-subtle)]" />
        <p className="text-sm font-mono text-[var(--cosmic-text-muted)]">No astrometric position data for this source.</p>
        <p className="text-xs text-[var(--cosmic-text-subtle)]">Select a source from the Candidate Queue to see multi-epoch positions.</p>
      </div>
    );
  }

  // Compute SVG plot bounds from RA/Dec offsets in arcseconds from T1 reference
  const ref = data.positions[0];
  const cosDecMid = Math.cos(ref.dec * Math.PI / 180);
  const plotPoints = data.positions.map(p => {
    const dRa = (p.ra - ref.ra) * 3600 * cosDecMid;
    const dDec = (p.dec - ref.dec) * 3600;
    return { epoch: p.epoch, dRa, dDec, p };
  });

  const allDRa = plotPoints.map(x => x.dRa);
  const allDDec = plotPoints.map(x => x.dDec);
  const minRa = Math.min(...allDRa);
  const maxRa = Math.max(...allDRa);
  const minDec = Math.min(...allDDec);
  const maxDec = Math.max(...allDDec);
  const padRa = Math.max((maxRa - minRa) * 0.3, 5);
  const padDec = Math.max((maxDec - minDec) * 0.3, 5);

  const svgW = 480, svgH = 280;
  const marginL = 55, marginR = 16, marginT = 16, marginB = 42;
  const plotW = svgW - marginL - marginR;
  const plotH = svgH - marginT - marginB;

  const toSvgX = (ra: number) =>
    marginL + ((ra - (minRa - padRa)) / ((maxRa + padRa) - (minRa - padRa))) * plotW;
  const toSvgY = (dec: number) =>
    marginT + plotH - ((dec - (minDec - padDec)) / ((maxDec + padDec) - (minDec - padDec))) * plotH;

  const pathD = plotPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(pt.dRa).toFixed(1)},${toSvgY(pt.dDec).toFixed(1)}`)
    .join(' ');

  // Overall motion calculations (only when at least 2 epochs exist)
  const hasMultipleEpochs = data.positions.length >= 2;
  const firstPos = data.positions[0];
  const lastPos = data.positions[data.positions.length - 1];
  const cosDecMidTotal = Math.cos(((firstPos.dec + lastPos.dec) / 2) * (Math.PI / 180));
  const totalDRa = (lastPos.ra - firstPos.ra) * 3600 * cosDecMidTotal;
  const totalDDec = (lastPos.dec - firstPos.dec) * 3600;
  const netDisplacementArcsec = Math.sqrt(totalDRa ** 2 + totalDDec ** 2);
  const totalBaselineHours = (lastPos.julianDate - firstPos.julianDate) * 24;
  const angularSpeedArcsecPerHr = totalBaselineHours > 0 ? netDisplacementArcsec / totalBaselineHours : 0;

  return (
    <div className="space-y-4">
      {/* Illustrative label */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-500">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Illustrative astrometry — {data.provenanceNote}</span>
      </div>

      {/* Metric summary strip if multiple epochs exist */}
      {hasMultipleEpochs ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="obs-card p-3 font-mono">
            <span className="text-[10px] text-[var(--cosmic-text-subtle)] block">Epochs Sampled</span>
            <span className="text-sm font-bold text-[var(--cosmic-text)]">{data.positions.length} ({firstPos.epoch} → {lastPos.epoch})</span>
          </div>
          <div className="obs-card p-3 font-mono">
            <span className="text-[10px] text-[var(--cosmic-text-subtle)] block">Net Displacement</span>
            <span className="text-sm font-bold text-[var(--cosmic-cyan)]">{netDisplacementArcsec.toFixed(3)}″</span>
          </div>
          <div className="obs-card p-3 font-mono">
            <span className="text-[10px] text-[var(--cosmic-text-subtle)] block">Time Baseline</span>
            <span className="text-sm font-bold text-[var(--cosmic-text)]">{totalBaselineHours.toFixed(1)} hrs ({(totalBaselineHours / 24).toFixed(2)} d)</span>
          </div>
          <div className="obs-card p-3 font-mono">
            <span className="text-[10px] text-[var(--cosmic-text-subtle)] block">Apparent Motion</span>
            <span className="text-sm font-bold text-[var(--cosmic-violet)]">{angularSpeedArcsecPerHr.toFixed(3)}″/hr</span>
          </div>
        </div>
      ) : (
        <div className="obs-card p-3.5 flex items-center gap-2 text-xs font-mono text-[var(--cosmic-text-muted)] border border-amber-500/30 bg-amber-500/5">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Single epoch detection ({data.positions[0]?.epoch}). Apparent displacement and angular motion cannot be computed without at least two observation epochs.</span>
        </div>
      )}

      {/* Sky motion plot */}
      <div className="obs-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--cosmic-violet)]" />
            <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">Sky Motion Trajectory</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--cosmic-text-subtle)]">
            Offset from {ref.epoch} reference position
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full font-mono" style={{ maxHeight: 300 }}>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const decVal = (minDec - padDec) + t * ((maxDec + padDec) - (minDec - padDec));
              const y = toSvgY(decVal);
              return (
                <g key={t}>
                  <line x1={marginL} x2={svgW - marginR} y1={y} y2={y}
                    stroke="var(--cosmic-chart-grid)" strokeWidth="0.5" />
                  <text x={marginL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="var(--cosmic-chart-text)">
                    {decVal.toFixed(1)}"
                  </text>
                </g>
              );
            })}
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const raVal = (minRa - padRa) + t * ((maxRa + padRa) - (minRa - padRa));
              const x = toSvgX(raVal);
              return (
                <g key={t}>
                  <line x1={x} x2={x} y1={marginT} y2={svgH - marginB}
                    stroke="var(--cosmic-chart-grid)" strokeWidth="0.5" />
                  <text x={x} y={svgH - marginB + 12} textAnchor="middle" fontSize="8" fill="var(--cosmic-chart-text)">
                    {raVal.toFixed(1)}"
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x={(marginL + svgW - marginR) / 2} y={svgH - 4} textAnchor="middle" fontSize="9"
              fill="var(--cosmic-text-muted)">ΔRA (arcsec, E positive)</text>
            <text x={10} y={(marginT + svgH - marginB) / 2} textAnchor="middle" fontSize="9"
              fill="var(--cosmic-text-muted)"
              transform={`rotate(-90, 10, ${(marginT + svgH - marginB) / 2})`}>ΔDec (arcsec)</text>

            {/* Motion path */}
            {plotPoints.length > 1 && (
              <path d={pathD} fill="none" stroke="var(--cosmic-cyan)" strokeWidth="1"
                strokeDasharray="3 2" opacity="0.6" />
            )}

            {/* Epoch points */}
            {plotPoints.map(pt => {
              const x = toSvgX(pt.dRa);
              const y = toSvgY(pt.dDec);
              const color = EPOCH_COLORS[pt.epoch] || '#94A3B8';
              return (
                <g key={pt.epoch}>
                  {/* Uncertainty circle if available */}
                  {pt.p.posUncertArcsec && (
                    <circle cx={x} cy={y}
                      r={Math.min(pt.p.posUncertArcsec * plotW / ((maxRa + padRa) - (minRa - padRa)), 12)}
                      fill={color} opacity="0.1" />
                  )}
                  <circle cx={x} cy={y} r="5" fill={color} opacity="0.9" />
                  <text x={x + 8} y={y - 6} fontSize="8" fill={color} fontWeight="bold">{pt.epoch}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Position table */}
      <div className="obs-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crosshair className="w-4 h-4 text-[var(--cosmic-cyan)]" />
          <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">Multi-Epoch Positions (ICRS)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-[var(--cosmic-border)]">
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Epoch</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Obs Time (UTC)</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">RA (ICRS)</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Dec (ICRS)</th>
                <th className="text-left py-1.5 text-[var(--cosmic-text-muted)] font-medium">Pos. Uncert.</th>
              </tr>
            </thead>
            <tbody>
              {data.positions.map(pos => (
                <tr key={pos.epoch} className="border-b border-[var(--cosmic-border)]/40 hover:bg-[var(--cosmic-surface-hover)] transition-colors">
                  <td className="py-1.5 pr-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: `${EPOCH_COLORS[pos.epoch]}20`, color: EPOCH_COLORS[pos.epoch] }}>
                      {pos.epoch}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-text-muted)]">{pos.timestamp.replace('T',' ').replace('Z','')}</td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-cyan)]">{formatRA(pos.ra)}</td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-violet)]">{formatDec(pos.dec)}</td>
                  <td className="py-1.5 text-[var(--cosmic-text-muted)]">
                    {pos.posUncertArcsec !== undefined
                      ? `± ${pos.posUncertArcsec.toFixed(2)}"` 
                      : <span className="text-[var(--cosmic-text-subtle)] italic">not provided</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Displacement table */}
      {data.displacements.length > 0 && (
        <div className="obs-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3.5 h-3.5 text-[var(--cosmic-amber)]" />
            <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">
              Epoch-to-Epoch Displacement
            </span>
            <span className="text-[10px] font-mono text-amber-500 ml-auto">[Illustrative — derived from mock positions]</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="border-b border-[var(--cosmic-border)]">
                  <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Interval</th>
                  <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">ΔRA (arcsec)</th>
                  <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">ΔDec (arcsec)</th>
                  <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Displacement</th>
                  <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Δt (hours)</th>
                  <th className="text-left py-1.5 text-[var(--cosmic-text-muted)] font-medium">Apparent Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.displacements.map(d => (
                  <tr key={`${d.fromEpoch}-${d.toEpoch}`}
                    className="border-b border-[var(--cosmic-border)]/40 hover:bg-[var(--cosmic-surface-hover)] transition-colors">
                    <td className="py-1.5 pr-4 text-[var(--cosmic-text-muted)]">{d.fromEpoch} → {d.toEpoch}</td>
                    <td className="py-1.5 pr-4"
                      style={{ color: d.deltaRaArcsec >= 0 ? '#10B981' : '#F43F5E' }}>
                      {d.deltaRaArcsec >= 0 ? '+' : ''}{d.deltaRaArcsec.toFixed(3)}″
                    </td>
                    <td className="py-1.5 pr-4"
                      style={{ color: d.deltaDecArcsec >= 0 ? '#10B981' : '#F43F5E' }}>
                      {d.deltaDecArcsec >= 0 ? '+' : ''}{d.deltaDecArcsec.toFixed(3)}″
                    </td>
                    <td className="py-1.5 pr-4 text-[var(--cosmic-cyan)] font-bold">{d.totalArcsec.toFixed(3)}″</td>
                    <td className="py-1.5 pr-4 text-[var(--cosmic-text-muted)]">{d.timeBaselineHours.toFixed(2)} h</td>
                    <td className="py-1.5 text-[var(--cosmic-violet)] font-medium">
                      {d.timeBaselineHours > 0 ? `${(d.totalArcsec / d.timeBaselineHours).toFixed(3)}″/hr` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

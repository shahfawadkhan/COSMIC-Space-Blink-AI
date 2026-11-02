import React from 'react';
import { AlertTriangle, BarChart2, Info } from 'lucide-react';
import { LightCurveData } from '../../types/analysis';

interface LightCurveProps {
  data: LightCurveData | null;
  loading?: boolean;
}

const EPOCH_COLORS: Record<string, string> = {
  T1: '#38BDF8',
  T2: '#818CF8',
  T3: '#10B981',
  T4: '#F59E0B',
};

export const LightCurve: React.FC<LightCurveProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="obs-card p-6 flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-[var(--cosmic-cyan)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[var(--cosmic-text-muted)]">Loading light-curve data…</span>
      </div>
    );
  }
  if (!data || data.measurements.length === 0) {
    return (
      <div className="obs-card p-8 flex flex-col items-center gap-3 text-center">
        <BarChart2 className="w-8 h-8 text-[var(--cosmic-text-subtle)]" />
        <p className="text-sm font-mono text-[var(--cosmic-text-muted)]">No photometric measurements available for this source.</p>
        <p className="text-xs text-[var(--cosmic-text-subtle)]">Photometric time-series requires multi-epoch flux measurements.</p>
      </div>
    );
  }

  const meas = data.measurements;
  const fluxes = meas.map(m => m.fluxMjy);
  const errs = meas.map(m => m.fluxErrMjy ?? 0);
  const minFlux = Math.min(...fluxes.map((f, i) => f - errs[i]));
  const maxFlux = Math.max(...fluxes.map((f, i) => f + errs[i]));
  const jds = meas.map(m => m.julianDate);
  const minJD = Math.min(...jds);
  const maxJD = Math.max(...jds);

  const svgW = 480, svgH = 260;
  const marginL = 55, marginR = 20, marginT = 20, marginB = 44;
  const plotW = svgW - marginL - marginR;
  const plotH = svgH - marginT - marginB;
  const padFlux = (maxFlux - minFlux) * 0.25 || 0.1;
  const padJD = (maxJD - minJD) * 0.1 || 0.5;

  const toX = (jd: number) =>
    marginL + ((jd - (minJD - padJD)) / ((maxJD + padJD) - (minJD - padJD))) * plotW;
  const toY = (flux: number) =>
    marginT + plotH - ((flux - (minFlux - padFlux)) / ((maxFlux + padFlux) - (minFlux - padFlux))) * plotH;

  // Tick values
  const fluxTicks = [0, 0.25, 0.5, 0.75, 1].map(t =>
    (minFlux - padFlux) + t * ((maxFlux + padFlux) - (minFlux - padFlux))
  );

  return (
    <div className="space-y-4">
      {/* Illustrative label */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-500">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Illustrative photometry — {data.provenanceNote} (No variability detection claimed from synthetic test data)</span>
      </div>

      {meas.length === 1 && (
        <div className="obs-card p-3 flex items-center gap-2 text-xs font-mono text-[var(--cosmic-text-muted)] border border-amber-500/30 bg-amber-500/5">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Single epoch measurement ({meas[0].epoch}). Time-series variability analysis requires multiple observation epochs.</span>
        </div>
      )}

      {/* Light curve plot */}
      <div className="obs-card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[var(--cosmic-green)]" />
            <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">
              Brightness vs. Time (mJy)
            </span>
          </div>
          <div className="flex items-center gap-3">
            {meas.map(m => (
              <span key={m.epoch} className="flex items-center gap-1 text-[10px] font-mono">
                <span className="w-2 h-2 rounded-full" style={{ background: EPOCH_COLORS[m.epoch] }} />
                <span style={{ color: EPOCH_COLORS[m.epoch] }}>{m.epoch}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full font-mono" style={{ maxHeight: 280 }}>
            {/* Grid lines */}
            {fluxTicks.map((fv, i) => {
              const y = toY(fv);
              return (
                <g key={i}>
                  <line x1={marginL} x2={svgW - marginR} y1={y} y2={y}
                    stroke="var(--cosmic-chart-grid)" strokeWidth="0.5" />
                  <text x={marginL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="var(--cosmic-chart-text)">
                    {fv.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Connecting line */}
            <polyline
              points={meas.map(m => `${toX(m.julianDate).toFixed(1)},${toY(m.fluxMjy).toFixed(1)}`).join(' ')}
              fill="none" stroke="var(--cosmic-cyan)" strokeWidth="1.2" opacity="0.5" />

            {/* Data points with error bars */}
            {meas.map(m => {
              const x = toX(m.julianDate);
              const y = toY(m.fluxMjy);
              const color = EPOCH_COLORS[m.epoch] || '#94A3B8';
              const errPx = m.fluxErrMjy
                ? (m.fluxErrMjy / ((maxFlux + padFlux) - (minFlux - padFlux))) * plotH
                : 0;
              return (
                <g key={m.epoch}>
                  {m.fluxErrMjy && (
                    <line x1={x} x2={x} y1={y - errPx} y2={y + errPx}
                      stroke={color} strokeWidth="1.5" opacity="0.6" />
                  )}
                  {m.fluxErrMjy && (
                    <>
                      <line x1={x - 3} x2={x + 3} y1={y - errPx} y2={y - errPx} stroke={color} strokeWidth="1" />
                      <line x1={x - 3} x2={x + 3} y1={y + errPx} y2={y + errPx} stroke={color} strokeWidth="1" />
                    </>
                  )}
                  <circle cx={x} cy={y} r="5" fill={color} opacity="0.9" />
                  <text x={x} y={y - 9} textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">{m.epoch}</text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x={(marginL + svgW - marginR) / 2} y={svgH - 4} textAnchor="middle"
              fontSize="9" fill="var(--cosmic-text-muted)">Julian Date (JD)</text>
            <text x={10} y={(marginT + svgH - marginB) / 2} textAnchor="middle"
              fontSize="9" fill="var(--cosmic-text-muted)"
              transform={`rotate(-90, 10, ${(marginT + svgH - marginB) / 2})`}>
              Flux Density (mJy)
            </text>

            {/* X-axis JD labels */}
            {meas.map(m => (
              <text key={m.epoch} x={toX(m.julianDate)} y={svgH - marginB + 12}
                textAnchor="middle" fontSize="7.5" fill="var(--cosmic-chart-text)">
                {m.julianDate.toFixed(2)}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Measurements table */}
      <div className="obs-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
          <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">Photometric Measurements</span>
          <span className="text-[10px] font-mono text-amber-500 ml-auto">[Illustrative]</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-[var(--cosmic-border)]">
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Epoch</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Obs Time (UTC)</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Band</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Flux (mJy)</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Uncertainty</th>
                <th className="text-left py-1.5 text-[var(--cosmic-text-muted)] font-medium">SNR</th>
              </tr>
            </thead>
            <tbody>
              {meas.map(m => (
                <tr key={m.epoch}
                  className="border-b border-[var(--cosmic-border)]/40 hover:bg-[var(--cosmic-surface-hover)] transition-colors">
                  <td className="py-1.5 pr-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: `${EPOCH_COLORS[m.epoch]}20`, color: EPOCH_COLORS[m.epoch] }}>
                      {m.epoch}
                    </span>
                  </td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-text-muted)]">
                    {m.timestamp.replace('T',' ').replace('Z','')}
                  </td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-text-subtle)] text-[10px]">{m.band}</td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-cyan)] font-bold">{m.fluxMjy.toFixed(3)}</td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-text-muted)]">
                    {m.fluxErrMjy !== undefined
                      ? `± ${m.fluxErrMjy.toFixed(3)}`
                      : <span className="italic text-[var(--cosmic-text-subtle)]">not provided</span>}
                  </td>
                  <td className="py-1.5 text-[var(--cosmic-text-muted)]">
                    {m.snr !== undefined ? m.snr.toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

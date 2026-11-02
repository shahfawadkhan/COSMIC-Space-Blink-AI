import React, { useState } from 'react';
import { AlertTriangle, Layers, Info, Eye, EyeOff } from 'lucide-react';
import { SpectrumData } from '../../types/analysis';

interface SpectrumAnalysisProps {
  data: SpectrumData | null;
  loading?: boolean;
}

const BAND_COLORS = ['#38BDF8','#818CF8','#10B981','#F59E0B','#F43F5E','#A78BFA'];
const BAND_LABELS = ['B1','B2','B3','B4','B5','B6'];

export const SpectrumAnalysis: React.FC<SpectrumAnalysisProps> = ({ data, loading }) => {
  const [showChannels, setShowChannels] = useState(false);

  if (loading) {
    return (
      <div className="obs-card p-6 flex items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-[var(--cosmic-cyan)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[var(--cosmic-text-muted)]">Loading spectral data…</span>
      </div>
    );
  }
  if (!data || data.broadBandPoints.length === 0) {
    return (
      <div className="obs-card p-8 flex flex-col items-center gap-3 text-center">
        <Layers className="w-8 h-8 text-[var(--cosmic-text-subtle)]" />
        <p className="text-sm font-mono text-[var(--cosmic-text-muted)]">No spectral data for this source.</p>
        <p className="text-xs text-[var(--cosmic-text-subtle)]">Select a source with SPHEREx broad-band measurements.</p>
      </div>
    );
  }

  const bb = data.broadBandPoints;
  const minW = Math.min(...bb.map(b => b.wavelengthMinMicrons));
  const maxW = Math.max(...bb.map(b => b.wavelengthMaxMicrons));
  const allFlux = bb.map(b => b.fluxMjy);
  const allErr = bb.map(b => b.uncertaintyMjy ?? 0);
  const minF = Math.min(...allFlux.map((f, i) => f - allErr[i]));
  const maxF = Math.max(...allFlux.map((f, i) => f + allErr[i]));

  const svgW = 480, svgH = 260;
  const marginL = 55, marginR = 20, marginT = 20, marginB = 44;
  const plotW = svgW - marginL - marginR;
  const plotH = svgH - marginT - marginB;
  const padW = (maxW - minW) * 0.08;
  const padF = (maxF - minF) * 0.25 || 0.1;

  const toX = (w: number) =>
    marginL + ((w - (minW - padW)) / ((maxW + padW) - (minW - padW))) * plotW;
  const toY = (f: number) =>
    marginT + plotH - ((f - (minF - padF)) / ((maxF + padF) - (minF - padF))) * plotH;

  const fluxTicks = [0,0.25,0.5,0.75,1].map(t =>
    (minF - padF) + t * ((maxF + padF) - (minF - padF))
  );

  return (
    <div className="space-y-4">
      {/* Provenance label */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-500">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Illustrative SED — {data.provenanceNote}</span>
      </div>

      {/* Clarification: 6 bands vs 102 channels */}
      <div className="obs-card p-3 flex items-start gap-2 text-xs font-mono text-[var(--cosmic-text-muted)]">
        <Info className="w-4 h-4 shrink-0 text-[var(--cosmic-cyan)] mt-0.5" />
        <div>
          <span className="text-[var(--cosmic-text)]">SPHEREx has 6 broad photometric bands</span> spanning 0.75–5.00 µm,
          each subdivided into ≈17 narrow spectral channels (102 total, R ≈ 41–130).
          The broad-band SED shown here is derived from the 6 band-averaged flux measurements in the mock data.
          Channel-level spectra are <span className="text-amber-400">not available</span> in this simulated dataset.
        </div>
      </div>

      {/* SED Plot */}
      <div className="obs-card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--cosmic-violet)]" />
            <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">
              Spectral Energy Distribution (SED)
            </span>
            <span className="text-[10px] text-[var(--cosmic-text-subtle)] font-mono">6 broad bands</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {bb.map((b, i) => (
              <span key={b.bandId} className="flex items-center gap-1 text-[10px] font-mono">
                <span className="w-2 h-2 rounded-sm" style={{ background: BAND_COLORS[i] }} />
                <span style={{ color: BAND_COLORS[i] }}>{BAND_LABELS[i]}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full font-mono" style={{ maxHeight: 280 }}>
            {/* Grid */}
            {fluxTicks.map((fv, i) => (
              <g key={i}>
                <line x1={marginL} x2={svgW - marginR} y1={toY(fv)} y2={toY(fv)}
                  stroke="var(--cosmic-chart-grid)" strokeWidth="0.5" />
                <text x={marginL - 4} y={toY(fv) + 3} textAnchor="end" fontSize="8"
                  fill="var(--cosmic-chart-text)">{fv.toFixed(2)}</text>
              </g>
            ))}

            {/* Band regions */}
            {bb.map((b, i) => {
              const x1 = toX(b.wavelengthMinMicrons);
              const x2 = toX(b.wavelengthMaxMicrons);
              return (
                <rect key={b.bandId} x={x1} y={marginT} width={x2 - x1} height={plotH}
                  fill={BAND_COLORS[i]} opacity="0.05" />
              );
            })}

            {/* Connecting line through centers */}
            <polyline
              points={bb.map(b => `${toX(b.wavelengthCenterMicrons).toFixed(1)},${toY(b.fluxMjy).toFixed(1)}`).join(' ')}
              fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 2" />

            {/* Band bars + error bars + points */}
            {bb.map((b, i) => {
              const cx = toX(b.wavelengthCenterMicrons);
              const x1 = toX(b.wavelengthMinMicrons);
              const x2 = toX(b.wavelengthMaxMicrons);
              const cy = toY(b.fluxMjy);
              const color = BAND_COLORS[i];
              const errPx = b.uncertaintyMjy
                ? (b.uncertaintyMjy / ((maxF + padF) - (minF - padF))) * plotH
                : 0;
              return (
                <g key={b.bandId}>
                  {/* Band width indicator */}
                  <line x1={x1} x2={x2} y1={cy} y2={cy} stroke={color} strokeWidth="2.5" opacity="0.3" />
                  {/* Error bar */}
                  {b.uncertaintyMjy && (
                    <>
                      <line x1={cx} x2={cx} y1={cy - errPx} y2={cy + errPx} stroke={color} strokeWidth="1.5" />
                      <line x1={cx-4} x2={cx+4} y1={cy-errPx} y2={cy-errPx} stroke={color} strokeWidth="1" />
                      <line x1={cx-4} x2={cx+4} y1={cy+errPx} y2={cy+errPx} stroke={color} strokeWidth="1" />
                    </>
                  )}
                  <circle cx={cx} cy={cy} r="5" fill={color} opacity="0.9" />
                  <text x={cx} y={cy - 9} textAnchor="middle" fontSize="7.5" fill={color} fontWeight="bold">
                    {BAND_LABELS[i]}
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text x={(marginL + svgW - marginR) / 2} y={svgH - 4} textAnchor="middle"
              fontSize="9" fill="var(--cosmic-text-muted)">Wavelength (µm)</text>
            <text x={10} y={(marginT + svgH - marginB) / 2} textAnchor="middle"
              fontSize="9" fill="var(--cosmic-text-muted)"
              transform={`rotate(-90, 10, ${(marginT + svgH - marginB) / 2})`}>
              Flux Density (mJy)
            </text>

            {/* X-axis wavelength labels */}
            {[0.75, 1.11, 1.64, 2.42, 3.82, 4.42, 5.00].map(w => (
              <text key={w} x={toX(w)} y={svgH - marginB + 12} textAnchor="middle"
                fontSize="7.5" fill="var(--cosmic-chart-text)">{w.toFixed(2)}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Broad-band table */}
      <div className="obs-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
          <span className="text-xs font-mono font-bold text-[var(--cosmic-text)]">Broad-Band Flux Table</span>
          <span className="text-[10px] font-mono text-amber-500 ml-auto">[6 SPHEREx bands — illustrative]</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-[var(--cosmic-border)]">
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Band</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Range (µm)</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Center (µm)</th>
                <th className="text-left py-1.5 pr-4 text-[var(--cosmic-text-muted)] font-medium">Flux (mJy)</th>
                <th className="text-left py-1.5 text-[var(--cosmic-text-muted)] font-medium">Uncertainty</th>
              </tr>
            </thead>
            <tbody>
              {bb.map((b, i) => (
                <tr key={b.bandId}
                  className="border-b border-[var(--cosmic-border)]/40 hover:bg-[var(--cosmic-surface-hover)] transition-colors">
                  <td className="py-1.5 pr-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: `${BAND_COLORS[i]}20`, color: BAND_COLORS[i] }}>
                      {BAND_LABELS[i]}
                    </span>
                    <span className="ml-1.5 text-[var(--cosmic-text-muted)]">{b.bandName.replace('SPHEREx ','')}</span>
                  </td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-text-subtle)]">
                    {b.wavelengthMinMicrons.toFixed(2)}–{b.wavelengthMaxMicrons.toFixed(2)}
                  </td>
                  <td className="py-1.5 pr-4 text-[var(--cosmic-text-muted)]">
                    {b.wavelengthCenterMicrons.toFixed(2)}
                  </td>
                  <td className="py-1.5 pr-4 font-bold" style={{ color: BAND_COLORS[i] }}>
                    {b.fluxMjy.toFixed(3)}
                  </td>
                  <td className="py-1.5 text-[var(--cosmic-text-muted)]">
                    {b.uncertaintyMjy !== undefined
                      ? `± ${b.uncertaintyMjy.toFixed(3)}`
                      : <span className="italic text-[var(--cosmic-text-subtle)]">not provided</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Channel coverage section (102 channels across 6 arrays) */}
      <div className="obs-card p-4">
        <button
          onClick={() => setShowChannels(v => !v)}
          className="w-full flex items-center justify-between text-xs font-mono text-[var(--cosmic-text)] hover:text-[var(--cosmic-cyan)] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {showChannels ? <EyeOff className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" /> : <Eye className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />}
            <span className="font-semibold">SPHEREx 102-Channel Availability Matrix</span>
          </div>
          <span className="text-[10px] text-[var(--cosmic-cyan)] bg-[var(--cosmic-surface-subtle)] px-2 py-0.5 rounded border border-[var(--cosmic-border)]">
            {showChannels ? 'Hide Channels' : 'Inspect 102 Channels'}
          </span>
        </button>
        {showChannels && (
          <div className="mt-3 space-y-3 pt-3 border-t border-[var(--cosmic-border)]">
            <p className="text-[10px] font-mono text-[var(--cosmic-text-muted)] leading-relaxed">
              SPHEREx observes through Linear Variable Filters across 6 focal plane arrays (17 channels each = 102 channels).
              In this mock simulation, only Band 1 channels (1–17) have synthesized spectrophotometry.
              Channels 18–102 are <strong className="text-amber-500">explicitly marked unavailable</strong> — no fake channels are fabricated.
            </p>
            <div className="space-y-2">
              {[
                { bandName: 'Band 1 (Array 1: 0.75 – 1.11 µm)', start: 1, end: 17, available: true, color: '#38BDF8' },
                { bandName: 'Band 2 (Array 2: 1.11 – 1.64 µm)', start: 18, end: 34, available: false, color: '#818CF8' },
                { bandName: 'Band 3 (Array 3: 1.64 – 2.42 µm)', start: 35, end: 51, available: false, color: '#10B981' },
                { bandName: 'Band 4 (Array 4: 2.42 – 3.82 µm)', start: 52, end: 68, available: false, color: '#F59E0B' },
                { bandName: 'Band 5 (Array 5: 3.82 – 4.42 µm)', start: 69, end: 85, available: false, color: '#F43F5E' },
                { bandName: 'Band 6 (Array 6: 4.42 – 5.00 µm)', start: 86, end: 102, available: false, color: '#A78BFA' },
              ].map(b => (
                <div key={b.start} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--cosmic-text-muted)] font-medium">{b.bandName}</span>
                    <span className={b.available ? 'text-emerald-400 font-semibold' : 'text-[var(--cosmic-text-subtle)]'}>
                      {b.available ? '17 Channels Available' : 'Channels Unavailable'}
                    </span>
                  </div>
                  <div className="grid grid-cols-[repeat(17,1fr)] gap-[2px]">
                    {Array.from({ length: 17 }, (_, idx) => {
                      const chIdx = b.start + idx;
                      return (
                        <div
                          key={chIdx}
                          className="h-5 rounded-sm flex items-center justify-center text-[7px] font-mono select-none"
                          style={
                            b.available
                              ? { background: `${b.color}25`, border: `1px solid ${b.color}60`, color: b.color }
                              : { background: 'var(--cosmic-surface-subtle)', border: '1px solid var(--cosmic-border)', color: 'var(--cosmic-text-subtle)', opacity: 0.5 }
                          }
                          title={`Channel ${chIdx}: ${b.available ? 'Available' : 'Unavailable in this test dataset'}`}
                        >
                          {chIdx}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

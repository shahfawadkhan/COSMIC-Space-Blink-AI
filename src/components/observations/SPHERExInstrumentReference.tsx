import React, { useState } from 'react';
import { Cpu, Layers, ChevronDown, ChevronUp, Info, Compass } from 'lucide-react';

export const SPHERExInstrumentReference: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const bands = [
    { band: 'Band 1', wavelength: '0.75 – 1.11 µm', channels: 'Channels 1–17', res: 'R ≈ 41', detector: 'H2RG SCA-101 (2.5µm cutoff)' },
    { band: 'Band 2', wavelength: '1.11 – 1.64 µm', channels: 'Channels 18–34', res: 'R ≈ 41', detector: 'H2RG SCA-102 (2.5µm cutoff)' },
    { band: 'Band 3', wavelength: '1.64 – 2.42 µm', channels: 'Channels 35–51', res: 'R ≈ 41', detector: 'H2RG SCA-103 (2.5µm cutoff)' },
    { band: 'Band 4', wavelength: '2.42 – 3.82 µm', channels: 'Channels 52–68', res: 'R ≈ 35', detector: 'H2RG SCA-104 (5.3µm cutoff)' },
    { band: 'Band 5', wavelength: '3.82 – 4.42 µm', channels: 'Channels 69–85', res: 'R ≈ 110', detector: 'H2RG SCA-105 (5.3µm cutoff)' },
    { band: 'Band 6', wavelength: '4.42 – 5.00 µm', channels: 'Channels 86–102', res: 'R ≈ 130', detector: 'H2RG SCA-106 (5.3µm cutoff)' }
  ];

  return (
    <div className="obs-card p-4 sm:p-5 border-[var(--cosmic-border)] bg-[var(--cosmic-surface)]">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--cosmic-cyan)] shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono text-[var(--cosmic-text)] flex items-center gap-2">
              <span>SPHEREx Instrument Architecture &amp; Spectral Reference</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-normal bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border border-[var(--cosmic-border)]">
                General Mission Specs
              </span>
            </h3>
            <p className="text-[11px] font-mono text-[var(--cosmic-text-muted)] mt-0.5">
              General baseline observatory specifications — separated from observation-specific mock records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--cosmic-text-subtle)] group-hover:text-[var(--cosmic-cyan)] transition-colors">
          <span>{isOpen ? 'Collapse' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded specifications */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[var(--cosmic-border)] space-y-4">
          {/* Top grid: General detector and telescope specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <span className="text-[10px] text-[var(--cosmic-text-subtle)] block mb-1">Detector Technology</span>
              <span className="text-[var(--cosmic-text)] font-semibold block">HAWAII-2RG (H2RG)</span>
              <span className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5 block">6 cryogenic HgCdTe arrays</span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <span className="text-[10px] text-[var(--cosmic-text-subtle)] block mb-1">Detector Dimensions</span>
              <span className="text-[var(--cosmic-text)] font-semibold block">2048 × 2048 pixels</span>
              <span className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5 block">Per focal plane array</span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <span className="text-[10px] text-[var(--cosmic-text-subtle)] block mb-1">Operating Temperature</span>
              <span className="text-[var(--cosmic-text)] font-semibold block">~55 K Passive</span>
              <span className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5 block">V-groove radiator cooling</span>
            </div>

            <div className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
              <span className="text-[10px] text-[var(--cosmic-text-subtle)] block mb-1">Pixel Scale &amp; FOV</span>
              <span className="text-[var(--cosmic-text)] font-semibold block">6.2″ / pixel</span>
              <span className="text-[10px] text-[var(--cosmic-text-muted)] mt-0.5 block">3.5° × 11.3° instantaneous FOV</span>
            </div>
          </div>

          {/* Architectural distinction note */}
          <div className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)] text-xs font-mono flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[var(--cosmic-cyan)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[var(--cosmic-text)]">
                Understanding Spectral Architecture: 6 Broad Bands vs. 102 Spectral Channels
              </span>
              <p className="text-[11px] text-[var(--cosmic-text-muted)] leading-relaxed">
                SPHEREx achieves all-sky spectroscopy through <strong>six broad spectral bands</strong>, each mapped onto an independent H2RG detector. Light passes through Linear Variable Filters (LVF) mounted directly over each focal plane. Rather than observing all 102 channels in a single pointing, each band encompasses approximately 17 discrete spectral channels (102 total across 0.75 to 5.00 µm). Full 102-channel spectra for a celestial target are accumulated across stepped sky sweeps.
              </p>
            </div>
          </div>

          {/* Table of 6 Broad Spectral Bands and Channel Allocations */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-[var(--cosmic-border)] rounded-lg overflow-hidden">
              <thead className="bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-subtle)] text-[11px] border-b border-[var(--cosmic-border)]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Broad Band</th>
                  <th className="py-2 px-3 font-semibold">Wavelength Range</th>
                  <th className="py-2 px-3 font-semibold">Channel Coverage</th>
                  <th className="py-2 px-3 font-semibold">Resolving Power</th>
                  <th className="py-2 px-3 font-semibold">Focal Plane Subsystem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cosmic-border)]">
                {bands.map(b => (
                  <tr key={b.band} className="hover:bg-[var(--cosmic-surface-hover)] transition-colors">
                    <td className="py-2 px-3 font-bold text-[var(--cosmic-cyan)] flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-[var(--cosmic-cyan)]" />
                      <span>{b.band}</span>
                    </td>
                    <td className="py-2 px-3 text-[var(--cosmic-text)]">{b.wavelength}</td>
                    <td className="py-2 px-3 text-[var(--cosmic-text-muted)]">{b.channels}</td>
                    <td className="py-2 px-3 text-[var(--cosmic-violet)] font-semibold">{b.res}</td>
                    <td className="py-2 px-3 text-[var(--cosmic-text-subtle)] text-[11px]">{b.detector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] font-mono text-[var(--cosmic-text-subtle)] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-[var(--cosmic-cyan)]" />
              Reference Source: NASA SPHEREx Mission Science &amp; Instrument Design Baseline
            </span>
            <span>Passive cryogenic survey</span>
          </div>
        </div>
      )}
    </div>
  );
};

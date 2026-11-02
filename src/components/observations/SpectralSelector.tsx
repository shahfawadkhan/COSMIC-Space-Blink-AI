import React, { useState } from 'react';
import { Layers, Info, Filter, AlertCircle } from 'lucide-react';
import { ObservationMetadata } from '../../types/observation';

interface SpectralSelectorProps {
  currentObservation: ObservationMetadata;
  selectedBand?: string;
  onSelectBand?: (bandId: string) => void;
}

const SPHEREX_BANDS = [
  { id: 'band1', name: 'Band 1', range: '0.75 – 1.11 µm', channelSpan: 'Channels 1–17', resolvingPower: 'R ≈ 41' },
  { id: 'band2', name: 'Band 2', range: '1.11 – 1.64 µm', channelSpan: 'Channels 18–34', resolvingPower: 'R ≈ 41' },
  { id: 'band3', name: 'Band 3', range: '1.64 – 2.42 µm', channelSpan: 'Channels 35–51', resolvingPower: 'R ≈ 41' },
  { id: 'band4', name: 'Band 4', range: '2.42 – 3.82 µm', channelSpan: 'Channels 52–68', resolvingPower: 'R ≈ 35' },
  { id: 'band5', name: 'Band 5', range: '3.82 – 4.42 µm', channelSpan: 'Channels 69–85', resolvingPower: 'R ≈ 110' },
  { id: 'band6', name: 'Band 6', range: '4.42 – 5.00 µm', channelSpan: 'Channels 86–102', resolvingPower: 'R ≈ 130' },
];

export const SpectralSelector: React.FC<SpectralSelectorProps> = ({
  currentObservation,
  selectedBand,
  onSelectBand
}) => {
  const [selectedChannelIndex, setSelectedChannelIndex] = useState<number | null>(null);

  // Determine active band from current observation
  const activeBandId = selectedBand || (
    currentObservation.filterBand.includes('Band 1') ? 'band1' :
    currentObservation.filterBand.includes('Band 2') ? 'band2' :
    currentObservation.filterBand.includes('Band 3') ? 'band3' :
    currentObservation.filterBand.includes('Band 4') ? 'band4' :
    currentObservation.filterBand.includes('Band 5') ? 'band5' :
    currentObservation.filterBand.includes('Band 6') ? 'band6' : 'band1'
  );

  const activeBandDef = SPHEREX_BANDS.find(b => b.id === activeBandId) || SPHEREX_BANDS[0];

  // Check if channel-level data is provided by the observation data model
  const hasChannelData = Boolean(currentObservation.spectralChannels);

  return (
    <div className="obs-card p-3 sm:p-4 border-[var(--cosmic-border)] bg-[var(--cosmic-surface)] text-xs font-mono space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--cosmic-border)]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[var(--cosmic-violet)]" />
          <h4 className="font-bold text-[var(--cosmic-text)]">
            Spectral Band &amp; Channel Selector
          </h4>
        </div>
        <div className="text-[10px] text-[var(--cosmic-text-muted)] flex items-center gap-1">
          <Filter className="w-3 h-3 text-[var(--cosmic-cyan)]" />
          <span>Active Cutout: <strong className="text-[var(--cosmic-cyan)]">{currentObservation.filterBand}</strong></span>
        </div>
      </div>

      {/* Six Broad Bands Selector Buttons */}
      <div>
        <span className="text-[10px] text-[var(--cosmic-text-subtle)] block mb-1.5">
          Six Broad SPHEREx Spectral Bands:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SPHEREX_BANDS.map(b => {
            const isCurrentCutoutBand = currentObservation.filterBand.includes(b.name);
            const isSelected = activeBandId === b.id;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBand?.(b.id)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--cosmic-violet-subtle)] border-[var(--cosmic-violet)] text-[var(--cosmic-text)] shadow-sm'
                    : 'bg-[var(--cosmic-surface-subtle)] border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] hover:border-[var(--cosmic-border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-[11px] text-[var(--cosmic-cyan)]">{b.name}</span>
                  {isCurrentCutoutBand && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Loaded
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--cosmic-text)]">{b.range}</div>
                <div className="text-[9px] text-[var(--cosmic-text-subtle)] mt-0.5">{b.resolvingPower}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel-Level Controls Section (Only shown when channels exist in data model) */}
      <div className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--cosmic-text)]">
            <Info className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            <span>Channel-Level Spectral Resolution ({activeBandDef.name}: {activeBandDef.channelSpan} of 102 Total)</span>
          </div>
          <span className="text-[10px] text-[var(--cosmic-text-muted)]">
            Resolving Power: <strong className="text-[var(--cosmic-violet)]">{activeBandDef.resolvingPower}</strong>
          </span>
        </div>

        {hasChannelData ? (
          <div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)] mb-2">
              Available Channels in Data Model: <strong className="text-[var(--cosmic-cyan)]">{currentObservation.spectralChannels}</strong>
            </div>

            {/* Illustrative Channel Sub-bands within active LVF */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 17 }).map((_, i) => {
                const channelNumber = (parseInt(activeBandDef.name.replace('Band ', ''), 10) - 1) * 17 + (i + 1);
                const isSelected = selectedChannelIndex === channelNumber;

                return (
                  <button
                    key={channelNumber}
                    type="button"
                    onClick={() => setSelectedChannelIndex(channelNumber)}
                    className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--cosmic-cyan)] text-slate-950 font-bold border-[var(--cosmic-cyan)]'
                        : 'bg-[var(--cosmic-surface)] text-[var(--cosmic-text-muted)] border-[var(--cosmic-border)] hover:text-[var(--cosmic-text)] hover:border-[var(--cosmic-cyan)]/40'
                    }`}
                    title={`SPHEREx Spectral Channel ${channelNumber} (LVF slice within ${activeBandDef.name})`}
                  >
                    Ch {channelNumber}
                  </button>
                );
              })}
            </div>

            {selectedChannelIndex && (
              <div className="mt-2 text-[10px] text-[var(--cosmic-cyan)]">
                Selected Channel {selectedChannelIndex} active in spectral slice visualizer.
              </div>
            )}
          </div>
        ) : (
          /* When channel-level data is NOT available in the observation model */
          <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Discrete 102-channel spectral breakdown is unavailable for this cutout. Displaying broad-band filter transmission only.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

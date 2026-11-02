import React, { useState, useEffect } from 'react';
import { Crosshair, BarChart2, Layers, ChevronDown } from 'lucide-react';
import { AnalysisTab, AnalysisSource, AstrometricAnalysisData, LightCurveData, SpectrumData } from '../../types/analysis';
import { analysisService } from '../../services/analysisService';
import { AstrometricAnalysis } from './AstrometricAnalysis';
import { LightCurve } from './LightCurve';
import { SpectrumAnalysis } from './SpectrumAnalysis';

interface AnalysisWorkspaceProps {
  sources: AnalysisSource[];
  initialSourceId?: string;
  initialTab?: AnalysisTab;
}

const TABS: { id: AnalysisTab; label: string; icon: React.ElementType }[] = [
  { id: 'astrometry', label: 'Astrometric Motion', icon: Crosshair },
  { id: 'lightcurve', label: 'Light Curve', icon: BarChart2 },
  { id: 'spectrum', label: 'Spectral SED', icon: Layers },
];

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  sources,
  initialSourceId,
  initialTab = 'astrometry',
}) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>(initialTab);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    initialSourceId || sources[0]?.id || ''
  );

  useEffect(() => {
    if (initialSourceId && sources.some(s => s.id === initialSourceId)) {
      setSelectedSourceId(initialSourceId);
    }
  }, [initialSourceId, sources]);

  const [astroData, setAstroData] = useState<AstrometricAnalysisData | null>(null);
  const [lcData, setLcData] = useState<LightCurveData | null>(null);
  const [specData, setSpecData] = useState<SpectrumData | null>(null);
  const [loadingAstro, setLoadingAstro] = useState(false);
  const [loadingLC, setLoadingLC] = useState(false);
  const [loadingSpec, setLoadingSpec] = useState(false);

  // Reload data when source changes
  useEffect(() => {
    if (!selectedSourceId) return;

    setLoadingAstro(true);
    analysisService.getAstrometricData(selectedSourceId)
      .then(d => setAstroData(d))
      .finally(() => setLoadingAstro(false));

    setLoadingLC(true);
    analysisService.getLightCurveData(selectedSourceId)
      .then(d => setLcData(d))
      .finally(() => setLoadingLC(false));

    setLoadingSpec(true);
    analysisService.getSpectrumData(selectedSourceId)
      .then(d => setSpecData(d))
      .finally(() => setLoadingSpec(false));
  }, [selectedSourceId]);

  const selectedSource = sources.find(s => s.id === selectedSourceId);

  return (
    <div className="space-y-4">
      {/* Source selector */}
      <div className="obs-card p-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-mono text-[var(--cosmic-text-muted)] shrink-0">Source:</span>
        <div className="relative">
          <select
            id="analysis-source-select"
            value={selectedSourceId}
            onChange={e => setSelectedSourceId(e.target.value)}
            className="appearance-none pr-7 pl-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-text)] focus:outline-none focus:border-[var(--cosmic-cyan)] cursor-pointer"
          >
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.id}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--cosmic-text-muted)] pointer-events-none" />
        </div>
        {selectedSource && (
          <span className="text-[10px] font-mono text-[var(--cosmic-text-subtle)]">
            RA {selectedSource.ra.toFixed(4)}° · Dec {selectedSource.dec >= 0 ? '+' : ''}{selectedSource.dec.toFixed(4)}°
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[var(--cosmic-border)] pb-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`analysis-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors -mb-[1px] cursor-pointer ${
                isActive
                  ? 'border-[var(--cosmic-cyan)] text-[var(--cosmic-cyan)]'
                  : 'border-transparent text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] hover:border-[var(--cosmic-border-strong)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'astrometry' && (
          <AstrometricAnalysis data={astroData} loading={loadingAstro} />
        )}
        {activeTab === 'lightcurve' && (
          <LightCurve data={lcData} loading={loadingLC} />
        )}
        {activeTab === 'spectrum' && (
          <SpectrumAnalysis data={specData} loading={loadingSpec} />
        )}
      </div>
    </div>
  );
};

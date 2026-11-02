import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { candidateService } from '../services/candidateService';
import {
  RotateCcw,
  CheckCircle2,
  Server,
  Compass,
  Layers,
  Sliders,
  Activity,
  AlertCircle,
  Database
} from 'lucide-react';
import {
  CoordinateFormat,
  MotionUnit,
  ComparisonDefaultMode,
  StretchFunction
} from '../types/settings';

export const SettingsPage: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const notify = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleResetData = () => {
    candidateService.resetToDefaultMock();
    notify('Local reviewer notes and status flags reset to initial catalog.');
  };

  const handleTestConnection = async () => {
    setPingStatus('testing');
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${settings.apiBaseUrl}/health`, {
        signal: controller.signal
      }).catch(() => null);
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);

      if (res && res.ok) {
        setPingStatus('success');
      } else {
        setPingStatus('failed');
      }
    } catch {
      setPingStatus('failed');
    }
  };

  const optBtn = (selected: boolean) =>
    `px-3 py-2 rounded-lg border text-left text-xs font-mono transition-all ${
      selected
        ? 'bg-[var(--cosmic-surface-hover)] border-[var(--cosmic-cyan)] text-[var(--cosmic-text)] ring-1 ring-[var(--cosmic-cyan)]/20'
        : 'bg-[var(--cosmic-surface-subtle)] border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)] hover:border-[var(--cosmic-border-strong)]'
    }`;

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--cosmic-border)]">
        <div>
          <h1 className="text-base font-bold text-[var(--cosmic-text)] tracking-tight font-mono">
            System &amp; Analysis Configuration
          </h1>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
            Astrometry parameters, blink comparison defaults, and pipeline API connectivity
          </p>
        </div>
        <button
          onClick={() => {
            resetSettings();
            notify('All preferences restored to defaults.');
          }}
          className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] hover:bg-[var(--cosmic-surface-hover)] text-xs font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] flex items-center gap-1.5 transition-colors border border-[var(--cosmic-border)] w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset defaults
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-lg bg-[var(--cosmic-green-subtle)] border border-[var(--cosmic-green)]/30 text-[var(--cosmic-green)] text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {saveMessage}
        </div>
      )}

      {/* SECTION 1: Backend & Data Pipeline */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--cosmic-cyan)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--cosmic-text)] font-mono">
              Pipeline &amp; Backend Integration
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)]">
            REST API v1
          </span>
        </div>

        <p className="text-xs text-[var(--cosmic-text-muted)] font-mono leading-relaxed">
          Configure how the workstation accesses candidate detections and multi-epoch cutouts. In prototype mode, local mock data is served with realistic observational noise and astrometry.
        </p>

        {/* Mode selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => {
              updateSetting('dataSourceMode', 'mock');
              notify('Switched to Standalone Prototype (Mock Catalog)');
            }}
            className={optBtn(settings.dataSourceMode === 'mock')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[var(--cosmic-text)]">Standalone Simulation</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] font-mono">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[var(--cosmic-text-muted)]">
              Embedded multi-epoch NEP-04 catalog with 4 simulated observation epochs.
            </p>
          </button>

          <button
            onClick={() => {
              updateSetting('dataSourceMode', 'api');
              notify('Switched to Connected Pipeline Backend');
            }}
            className={optBtn(settings.dataSourceMode === 'api')}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[var(--cosmic-text)]">Live Pipeline Backend</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)] font-mono">
                REST
              </span>
            </div>
            <p className="text-[11px] text-[var(--cosmic-text-muted)]">
              Connect to your backend service (FastAPI, Flask, or IRSA proxy pipeline).
            </p>
          </button>
        </div>

        {/* API Base URL Configuration */}
        <div className="pt-2 border-t border-[var(--cosmic-border)] space-y-2">
          <label className="block text-xs font-mono text-[var(--cosmic-text-muted)]">
            Backend API Endpoint:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={settings.apiBaseUrl}
              onChange={e => updateSetting('apiBaseUrl', e.target.value)}
              placeholder="http://localhost:8000/api/v1"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-text)] focus:outline-none focus:border-[var(--cosmic-cyan)]"
            />
            <button
              onClick={handleTestConnection}
              disabled={pingStatus === 'testing'}
              className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-cyan)] hover:border-[var(--cosmic-cyan)] transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Activity className="w-3.5 h-3.5" />
              {pingStatus === 'testing' ? 'Testing…' : 'Test Ping'}
            </button>
          </div>

          {pingStatus === 'success' && (
            <div className="text-[11px] font-mono text-[var(--cosmic-green)] flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected successfully ({pingLatency}ms response)
            </div>
          )}

          {pingStatus === 'failed' && (
            <div className="text-[11px] font-mono text-[var(--cosmic-amber)] flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Endpoint unreachable at {settings.apiBaseUrl} (backend service may be offline)
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Astrometry & Coordinates */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[var(--cosmic-cyan)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--cosmic-text)] font-mono">
            Astrometry &amp; Celestial Coordinates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Coordinate Format */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[var(--cosmic-text-muted)] block">
              Equatorial Coordinate Notation (ICRS J2000):
            </span>
            <div className="grid grid-cols-1 gap-2">
              {([
                { id: 'hms-dms' as CoordinateFormat, label: 'HMS / DMS', example: '18h 01m 22.1s  +66° 35′ 28″' },
                { id: 'decimal' as CoordinateFormat, label: 'Decimal Degrees', example: '270.3421°  +66.5912°' },
              ]).map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => {
                    updateSetting('coordinateFormat', fmt.id);
                    notify(`Coordinates → ${fmt.label}`);
                  }}
                  className={optBtn(settings.coordinateFormat === fmt.id)}
                >
                  <div className="font-semibold text-[var(--cosmic-text)] mb-0.5">{fmt.label}</div>
                  <div className="text-[10px] text-[var(--cosmic-text-muted)]">{fmt.example}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Proper Motion Units */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[var(--cosmic-text-muted)] block">
              Apparent Motion Rate Display:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {([
                { id: 'arcsec_per_hour' as MotionUnit, label: '″ / hour', desc: 'Standard for Solar System moving bodies' },
                { id: 'mas_per_year' as MotionUnit, label: 'mas / yr', desc: 'Stellar proper motion scale' },
                { id: 'arcmin_per_day' as MotionUnit, label: '′ / day', desc: 'Fast near-Earth object rate' },
              ]).map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    updateSetting('motionUnit', u.id);
                    notify(`Motion unit → ${u.label}`);
                  }}
                  className={optBtn(settings.motionUnit === u.id)}
                >
                  <div className="font-semibold text-[var(--cosmic-text)] mb-0.5">{u.label}</div>
                  <div className="text-[10px] text-[var(--cosmic-text-muted)]">{u.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Triage Motion Threshold */}
        <div className="pt-3 border-t border-[var(--cosmic-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-[var(--cosmic-text)] block font-semibold">
              Triage Flagging Motion Threshold:
            </span>
            <span className="text-[11px] font-mono text-[var(--cosmic-text-muted)]">
              Candidates with apparent motion above this rate are prioritized for review.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.05"
              max="1.50"
              step="0.05"
              value={settings.triageMotionThreshold}
              onChange={e => updateSetting('triageMotionThreshold', parseFloat(e.target.value))}
              className="w-28 accent-[var(--cosmic-cyan)] cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-[var(--cosmic-cyan)] min-w-[50px] text-right">
              {settings.triageMotionThreshold.toFixed(2)} ″/hr
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Blink Comparator Defaults */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--cosmic-cyan)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--cosmic-text)] font-mono">
            Blink Comparator &amp; Cutout Display
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default Comparison Mode */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[var(--cosmic-text-muted)] block">
              Default Inspection Mode:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'swipe' as ComparisonDefaultMode, label: 'Swipe Curtain' },
                { id: 'blink' as ComparisonDefaultMode, label: 'Blink Cycle' },
                { id: 'difference' as ComparisonDefaultMode, label: 'Difference' },
                { id: 'side-by-side' as ComparisonDefaultMode, label: 'Side by Side' },
              ]).map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    updateSetting('defaultComparisonMode', m.id);
                    notify(`Default mode → ${m.label}`);
                  }}
                  className={optBtn(settings.defaultComparisonMode === m.id)}
                >
                  <span className="font-semibold text-[var(--cosmic-text)] text-[11px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Blink Rate */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[var(--cosmic-text-muted)] block">
              Blink Alternation Interval:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {([
                { ms: 400, label: '400 ms', desc: 'Rapid' },
                { ms: 800, label: '800 ms', desc: 'Standard' },
                { ms: 1200, label: '1200 ms', desc: 'Detailed' },
                { ms: 2000, label: '2000 ms', desc: 'Slow' },
              ]).map(interval => (
                <button
                  key={interval.ms}
                  onClick={() => {
                    updateSetting('defaultBlinkIntervalMs', interval.ms);
                    notify(`Blink rate → ${interval.label}`);
                  }}
                  className={optBtn(settings.defaultBlinkIntervalMs === interval.ms)}
                >
                  <div className="font-semibold text-[var(--cosmic-text)] text-[11px]">{interval.label}</div>
                  <div className="text-[9px] text-[var(--cosmic-text-muted)]">{interval.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FITS Transfer Stretch */}
        <div className="pt-3 border-t border-[var(--cosmic-border)] space-y-2">
          <span className="text-xs font-mono text-[var(--cosmic-text-muted)] block">
            FITS Display Transfer Function (Stretch):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { id: 'asinh' as StretchFunction, label: 'Asinh', desc: 'High dynamic range' },
              { id: 'linear' as StretchFunction, label: 'Linear', desc: 'Direct pixel counts' },
              { id: 'sqrt' as StretchFunction, label: 'Square Root', desc: 'Mid-range balance' },
              { id: 'log' as StretchFunction, label: 'Logarithmic', desc: 'Faint diffuse features' },
            ]).map(st => (
              <button
                key={st.id}
                onClick={() => {
                  updateSetting('fitsStretch', st.id);
                  notify(`Transfer stretch → ${st.label}`);
                }}
                className={optBtn(settings.fitsStretch === st.id)}
              >
                <div className="font-semibold text-[var(--cosmic-text)] text-[11px]">{st.label}</div>
                <div className="text-[9px] text-[var(--cosmic-text-muted)]">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Appearance & Session Cache */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--cosmic-cyan)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--cosmic-text)] font-mono">
            Display Theme &amp; Session Storage
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              updateSetting('theme', 'dark-observatory');
              notify('Theme → Dark Observatory');
            }}
            className={optBtn(settings.theme === 'dark-observatory')}
          >
            <div className="font-semibold text-[var(--cosmic-text)] mb-0.5">Dark Observatory</div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)]">Deep charcoal &amp; muted blue-gray surfaces</div>
          </button>

          <button
            onClick={() => {
              updateSetting('theme', 'light-observatory');
              notify('Theme → Light Observatory');
            }}
            className={optBtn(settings.theme === 'light-observatory')}
          >
            <div className="font-semibold text-[var(--cosmic-text)] mb-0.5">Light Observatory</div>
            <div className="text-[10px] text-[var(--cosmic-text-muted)]">Clean white &amp; cool-slate surfaces</div>
          </button>
        </div>

        {/* Reset cache */}
        <div className="pt-3 border-t border-[var(--cosmic-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold font-mono text-[var(--cosmic-text)] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[var(--cosmic-text-muted)]" />
              Reset Local Review Annotations
            </h3>
            <p className="text-[11px] text-[var(--cosmic-text-muted)] mt-0.5 font-mono">
              Clears custom investigator notes and triage flags saved in browser storage.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] text-xs font-mono transition-colors shrink-0"
          >
            Clear session cache
          </button>
        </div>
      </div>
    </div>
  );
};

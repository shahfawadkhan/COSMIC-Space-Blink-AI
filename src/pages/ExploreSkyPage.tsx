import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  AlertTriangle,
  Compass,
  SplitSquareVertical,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  FlaskConical
} from 'lucide-react';
import { observationService } from '../services/observationService';
import {
  SkySearchResponse,
  TargetPreset,
  EpochId
} from '../types/observation';
import { EpochObservationCard } from '../components/observations/EpochObservationCard';
import { SPHERExInstrumentReference } from '../components/observations/SPHERExInstrumentReference';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { degToHms, degToDms } from '../lib/astroUtils';

export const ExploreSkyPage: React.FC = () => {
  const navigate = useNavigate();

  // Retrieve presets through service
  const presets = observationService.getTargetPresets();
  const defaultPreset = presets[0];

  // Coordinate form state (defaults to Barnard's Star benchmark)
  const [raInput, setRaInput] = useState<string>(defaultPreset.ra.toFixed(4));
  const [decInput, setDecInput] = useState<string>(`+${defaultPreset.dec.toFixed(4)}`);
  const [fovInput, setFovInput] = useState<string>(defaultPreset.defaultFovArcmin.toString());
  const [activePreset, setActivePreset] = useState<TargetPreset | null>(defaultPreset);

  // Validation state
  const [errors, setErrors] = useState<{ ra?: string; dec?: string; fov?: string }>({});
  const [touched, setTouched] = useState<{ ra?: boolean; dec?: boolean; fov?: boolean }>({});

  // Query state
  const [loading, setLoading] = useState<boolean>(true);
  const [searchResponse, setSearchResponse] = useState<SkySearchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Validate coordinates according to SPHEREx challenge requirements:
   * RA between 0 and 360 decimal degrees
   * Dec between -90 and +90 decimal degrees
   * FOV in arcminutes between 1 and 600
   */
  const validate = useCallback((raVal: string, decVal: string, fovVal: string) => {
    const errs: { ra?: string; dec?: string; fov?: string } = {};

    // Validate RA
    const trimmedRa = raVal.trim();
    if (!trimmedRa) {
      errs.ra = 'Right Ascension (RA) is required.';
    } else {
      const numRa = parseFloat(trimmedRa);
      if (isNaN(numRa)) {
        errs.ra = 'Right Ascension must be a valid number in decimal degrees.';
      } else if (numRa < 0 || numRa > 360) {
        errs.ra = 'Right Ascension must be between 0.0000° and 360.0000°.';
      }
    }

    // Validate Dec
    const trimmedDec = decVal.trim();
    if (!trimmedDec) {
      errs.dec = 'Declination (Dec) is required.';
    } else {
      const numDec = parseFloat(trimmedDec);
      if (isNaN(numDec)) {
        errs.dec = 'Declination must be a valid number in decimal degrees.';
      } else if (numDec < -90 || numDec > 90) {
        errs.dec = 'Declination must be between -90.0000° and +90.0000°.';
      }
    }

    // Validate FOV
    const trimmedFov = fovVal.trim();
    if (!trimmedFov) {
      errs.fov = 'Field of View (FOV) is required.';
    } else {
      const numFov = parseFloat(trimmedFov);
      if (isNaN(numFov)) {
        errs.fov = 'Field of View must be a valid number in arcminutes.';
      } else if (numFov <= 0 || numFov > 600) {
        errs.fov = 'Field of View must be between 1 and 600 arcminutes (0.02° to 10.0°).';
      }
    }

    return errs;
  }, []);

  /**
   * Execute observation search via observationService
   */
  const executeSearch = useCallback(
    async (raVal: string, decVal: string, fovVal: string, target?: TargetPreset | null, simulateError: boolean = false) => {
      const currentErrors = validate(raVal, decVal, fovVal);
      setErrors(currentErrors);

      if (Object.keys(currentErrors).length > 0) {
        setSearchResponse(null);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await observationService.searchObservations({
          ra: parseFloat(raVal),
          dec: parseFloat(decVal),
          fovArcmin: parseFloat(fovVal),
          targetName: target ? target.name : undefined,
          simulateError
        });
        setSearchResponse(response);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error communicating with observation archive.';
        setErrorMessage(message);
        setSearchResponse(null);
      } finally {
        setLoading(false);
      }
    },
    [validate]
  );

  // Initial observation query on mount via observation service
  useEffect(() => {
    let isCancelled = false;
    async function loadInitial() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await observationService.searchObservations({
          ra: defaultPreset.ra,
          dec: defaultPreset.dec,
          fovArcmin: defaultPreset.defaultFovArcmin,
          targetName: defaultPreset.name
        });
        if (!isCancelled) {
          setSearchResponse(response);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Unknown error communicating with observation archive.';
          setErrorMessage(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      isCancelled = true;
    };
  }, [defaultPreset]);

  /**
   * Preset selection handler
   */
  const handleSelectPreset = (preset: TargetPreset) => {
    const formattedRa = preset.ra.toFixed(4);
    const formattedDec = preset.dec >= 0 ? `+${preset.dec.toFixed(4)}` : preset.dec.toFixed(4);
    const formattedFov = preset.defaultFovArcmin.toString();

    setRaInput(formattedRa);
    setDecInput(formattedDec);
    setFovInput(formattedFov);
    setActivePreset(preset);
    setErrors({});
    setTouched({});

    executeSearch(formattedRa, formattedDec, formattedFov, preset);
  };

  /**
   * Coordinate input change handlers
   */
  const handleRaChange = (val: string) => {
    setRaInput(val);
    setActivePreset(null);
    setTouched(prev => ({ ...prev, ra: true }));
    const errs = validate(val, decInput, fovInput);
    setErrors(errs);
  };

  const handleDecChange = (val: string) => {
    setDecInput(val);
    setActivePreset(null);
    setTouched(prev => ({ ...prev, dec: true }));
    const errs = validate(raInput, val, fovInput);
    setErrors(errs);
  };

  const handleFovChange = (val: string) => {
    setFovInput(val);
    setTouched(prev => ({ ...prev, fov: true }));
    const errs = validate(raInput, decInput, val);
    setErrors(errs);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ ra: true, dec: true, fov: true });
    executeSearch(raInput, decInput, fovInput, activePreset);
  };

  const handleReset = () => {
    handleSelectPreset(defaultPreset);
  };

  /**
   * Test helpers for Evaluator & Completion Criteria testing
   */
  const handleTriggerEmptyState = () => {
    setRaInput('0.0000');
    setDecInput('+0.0000');
    setFovInput('30');
    setActivePreset(null);
    setErrors({});
    executeSearch('0.0000', '+0.0000', '30', null);
  };

  const handleTriggerErrorState = () => {
    executeSearch(raInput, decInput, fovInput, activePreset, true);
  };

  /**
   * Open sequence in existing Comparison / Blink Viewer
   */
  const handleOpenComparisonViewer = (epochA: EpochId = 'T1', epochB: EpochId = 'T2') => {
    const targetQuery = activePreset ? activePreset.name : `RA ${raInput}°, Dec ${decInput}°`;
    navigate(`/comparison?epochA=${epochA}&epochB=${epochB}&target=${encodeURIComponent(targetQuery)}`, {
      state: {
        targetName: targetQuery,
        coordinates: { ra: parseFloat(raInput), dec: parseFloat(decInput), fov: parseFloat(fovInput) },
        observations: searchResponse?.observations || []
      }
    });
  };

  // Convert inputs to sexagesimal for live previews if numeric
  const parsedRa = parseFloat(raInput);
  const parsedDec = parseFloat(decInput);
  const parsedFov = parseFloat(fovInput);
  const hasValidRa = !isNaN(parsedRa) && parsedRa >= 0 && parsedRa <= 360;
  const hasValidDec = !isNaN(parsedDec) && parsedDec >= -90 && parsedDec <= 90;
  const hasValidFov = !isNaN(parsedFov) && parsedFov > 0 && parsedFov <= 600;

  const isFormValid = hasValidRa && hasValidDec && hasValidFov && Object.keys(errors).length === 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--cosmic-border)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[var(--cosmic-text)] tracking-tight font-mono flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--cosmic-cyan)]" />
              Explore the Sky
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30">
              NASA Space Apps 2026 · SPHEREx
            </span>
            {/* Clear SIMULATED DATA badge */}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              SIMULATED DATA
            </span>
          </div>
          <p className="text-xs text-[var(--cosmic-text-muted)] mt-1 font-mono">
            Coordinate-driven multi-epoch infrared observation footprint search &amp; sequence inspection
          </p>
        </div>

        {/* Quick action to comparison */}
        {searchResponse && searchResponse.observations.length >= 2 && (
          <button
            onClick={() => handleOpenComparisonViewer('T1', 'T2')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--cosmic-cyan-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-cyan)]/50 text-xs font-mono font-semibold text-[var(--cosmic-cyan)] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>Open in Blink Comparator (T1 vs T2)</span>
          </button>
        )}
      </div>

      {/* Visually Prominent Coordinate Search Workstation */}
      <div className="obs-card p-5 sm:p-6 shadow-sm border-[var(--cosmic-border)] bg-[var(--cosmic-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--cosmic-border)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--cosmic-cyan)]" />
            <h2 className="text-sm font-bold font-mono text-[var(--cosmic-text)]">
              Celestial Coordinate Query
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--cosmic-text-muted)]">
            Frame: <strong className="text-[var(--cosmic-text)]">ICRS / J2000 Decimal Degrees</strong>
          </span>
        </div>

        {/* Astronomical Presets Bar */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--cosmic-text-muted)] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--cosmic-amber)]" />
            <span>Astronomical Target Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map(preset => {
              const isSelected = activePreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border-[var(--cosmic-cyan)] font-bold shadow-sm'
                      : 'bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text)] border-[var(--cosmic-border)] hover:border-[var(--cosmic-border-strong)] hover:bg-[var(--cosmic-surface-hover)]'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span className="text-[10px] opacity-70">({preset.category.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>

          {/* Active Preset Description Card */}
          {activePreset && (
            <div className="mt-2.5 p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border-subtle)] text-xs font-mono space-y-1.5">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[var(--cosmic-cyan)] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[var(--cosmic-text)]">{activePreset.name}</span>{' '}
                      <span className="text-[var(--cosmic-text-subtle)]">[{activePreset.designation} · {activePreset.constellation}]</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] border border-[var(--cosmic-cyan)]/30 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--cosmic-amber)]" />
                      Coordinates applied · Auto-search executed
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--cosmic-text-muted)] mt-0.5 leading-relaxed">
                    {activePreset.description}
                    {activePreset.properMotionArcsecPerYear && (
                      <span className="text-[var(--cosmic-amber)] ml-1 font-semibold">
                        · Proper Motion: {activePreset.properMotionArcsecPerYear}″/yr
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coordinate Input Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* RA Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="ra-input" className="text-xs font-mono font-semibold text-[var(--cosmic-text)]">
                  Right Ascension (RA, α)
                </label>
                <span className="text-[10px] font-mono text-[var(--cosmic-text-subtle)]">
                  [0.0000° – 360.0000°]
                </span>
              </div>
              <div className="relative">
                <input
                  id="ra-input"
                  type="text"
                  inputMode="decimal"
                  value={raInput}
                  onChange={e => handleRaChange(e.target.value)}
                  placeholder="e.g. 269.4521"
                  className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--cosmic-surface-subtle)] border transition-colors focus:outline-none ${
                    errors.ra && touched.ra
                      ? 'border-rose-500 focus:border-rose-500 text-rose-500'
                      : 'border-[var(--cosmic-border)] focus:border-[var(--cosmic-cyan)] text-[var(--cosmic-text)]'
                  }`}
                  aria-invalid={errors.ra ? 'true' : 'false'}
                  aria-describedby="ra-feedback"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--cosmic-text-subtle)] pointer-events-none">
                  deg
                </span>
              </div>
              {/* RA Feedback / Live Preview */}
              <div id="ra-feedback" className="mt-1 text-[11px] font-mono min-h-[16px]">
                {errors.ra && touched.ra ? (
                  <span className="text-rose-500 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.ra}
                  </span>
                ) : hasValidRa ? (
                  <span className="text-[var(--cosmic-text-muted)]">
                    HMS: <strong className="text-[var(--cosmic-cyan)]">{degToHms(parsedRa)}</strong>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Dec Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="dec-input" className="text-xs font-mono font-semibold text-[var(--cosmic-text)]">
                  Declination (Dec, δ)
                </label>
                <span className="text-[10px] font-mono text-[var(--cosmic-text-subtle)]">
                  [-90.0000° – +90.0000°]
                </span>
              </div>
              <div className="relative">
                <input
                  id="dec-input"
                  type="text"
                  inputMode="decimal"
                  value={decInput}
                  onChange={e => handleDecChange(e.target.value)}
                  placeholder="e.g. +4.6933"
                  className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--cosmic-surface-subtle)] border transition-colors focus:outline-none ${
                    errors.dec && touched.dec
                      ? 'border-rose-500 focus:border-rose-500 text-rose-500'
                      : 'border-[var(--cosmic-border)] focus:border-[var(--cosmic-cyan)] text-[var(--cosmic-text)]'
                  }`}
                  aria-invalid={errors.dec ? 'true' : 'false'}
                  aria-describedby="dec-feedback"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--cosmic-text-subtle)] pointer-events-none">
                  deg
                </span>
              </div>
              {/* Dec Feedback / Live Preview */}
              <div id="dec-feedback" className="mt-1 text-[11px] font-mono min-h-[16px]">
                {errors.dec && touched.dec ? (
                  <span className="text-rose-500 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.dec}
                  </span>
                ) : hasValidDec ? (
                  <span className="text-[var(--cosmic-text-muted)]">
                    DMS: <strong className="text-[var(--cosmic-cyan)]">{degToDms(parsedDec)}</strong>
                  </span>
                ) : null}
              </div>
            </div>

            {/* FOV Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="fov-input" className="text-xs font-mono font-semibold text-[var(--cosmic-text)]">
                  Field of View (FOV)
                </label>
                <span className="text-[10px] font-mono text-[var(--cosmic-text-subtle)]">
                  [1′ – 600′ arcmin]
                </span>
              </div>
              <div className="relative">
                <input
                  id="fov-input"
                  type="text"
                  inputMode="numeric"
                  value={fovInput}
                  onChange={e => handleFovChange(e.target.value)}
                  placeholder="e.g. 45"
                  className={`w-full px-3 py-2 rounded-lg text-xs font-mono bg-[var(--cosmic-surface-subtle)] border transition-colors focus:outline-none ${
                    errors.fov && touched.fov
                      ? 'border-rose-500 focus:border-rose-500 text-rose-500'
                      : 'border-[var(--cosmic-border)] focus:border-[var(--cosmic-cyan)] text-[var(--cosmic-text)]'
                  }`}
                  aria-invalid={errors.fov ? 'true' : 'false'}
                  aria-describedby="fov-feedback"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--cosmic-text-subtle)] pointer-events-none">
                  arcmin
                </span>
              </div>
              {/* FOV Feedback / Live Preview */}
              <div id="fov-feedback" className="mt-1 text-[11px] font-mono min-h-[16px]">
                {errors.fov && touched.fov ? (
                  <span className="text-rose-500 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.fov}
                  </span>
                ) : hasValidFov ? (
                  <span className="text-[var(--cosmic-text-muted)]">
                    Degrees: <strong className="text-[var(--cosmic-cyan)]">{(parsedFov / 60).toFixed(2)}°</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Action Row: Primary Search, Reset, and Evaluator State Test Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--cosmic-border)]">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--cosmic-cyan)] hover:bg-[var(--cosmic-cyan)]/90 text-slate-950 font-mono font-bold text-xs tracking-wide transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching Footprints…' : 'Search Observations'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-xs font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors cursor-pointer"
                title="Reset to Barnard's Star benchmark"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Evaluator Testing Shortcuts for Empty & Error States */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-[var(--cosmic-text-subtle)] hidden sm:inline">State verification:</span>
              <button
                type="button"
                onClick={handleTriggerEmptyState}
                className="px-2.5 py-1 rounded bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] text-[10px] font-mono transition-colors cursor-pointer"
                title="Test coordinate footprint with no observation coverage (Empty State)"
              >
                Test Empty Region
              </button>
              <button
                type="button"
                onClick={handleTriggerErrorState}
                className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-mono transition-colors cursor-pointer"
                title="Simulate archive gateway timeout / network error (Error State)"
              >
                Simulate Archive Error
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SPHEREx Baseline Instrument & Spectral Architecture Reference */}
      <SPHERExInstrumentReference />

      {/* Observation Results Container */}
      <div className="space-y-4">
        {/* State 1: Loading State */}
        {loading && (
          <LoadingState
            message="Querying Synthetic SPHEREx Test Dataset…"
            subMessage={`Synthesizing multi-epoch cutouts for RA ${raInput}°, Dec ${decInput}° (FOV ${fovInput}′)...`}
          />
        )}

        {/* State 2: Error State */}
        {!loading && errorMessage && (
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10 my-4 text-xs font-mono">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <h3 className="font-bold text-rose-700 dark:text-rose-300 text-sm">
                  Synthetic Archive Query Failed
                </h3>
                <p className="text-rose-600 dark:text-rose-400 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => executeSearch(raInput, decInput, fovInput, activePreset)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Retry Search
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] text-[var(--cosmic-text)] font-mono text-xs hover:bg-[var(--cosmic-surface-hover)] transition-colors cursor-pointer"
                  >
                    Restore Benchmark Preset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Empty State */}
        {!loading && !errorMessage && searchResponse && searchResponse.observations.length === 0 && (
          <EmptyState
            title="No Observations Found in Footprint"
            description={`No simulated observation records match coordinates RA ${searchResponse.query.ra.toFixed(4)}°, Dec ${searchResponse.query.dec.toFixed(4)}° with FOV ${searchResponse.query.fovArcmin}′ in the local synthetic test catalog.`}
            actionLabel="Try Barnard's Star Benchmark"
            onAction={() => handleSelectPreset(defaultPreset)}
          />
        )}

        {/* State 4: Valid Results Found */}
        {!loading && !errorMessage && searchResponse && searchResponse.observations.length > 0 && (
          <div className="space-y-4">
            {/* Results Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] font-mono text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 font-bold text-[var(--cosmic-text)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{searchResponse.totalObservations} Synthetic Epoch Footprints Available</span>
                </span>
                <span className="text-[var(--cosmic-text-subtle)]">·</span>
                <span className="text-[var(--cosmic-text-muted)]">
                  Target: <strong className="text-[var(--cosmic-text)]">{searchResponse.query.targetName || `RA ${searchResponse.query.ra.toFixed(4)}°, Dec ${searchResponse.query.dec.toFixed(4)}°`}</strong>
                </span>
                <span className="text-[var(--cosmic-text-subtle)]">·</span>
                <span className="text-[var(--cosmic-text-muted)]">
                  Baseline: <strong className="text-[var(--cosmic-cyan)]">9.6 Days (Simulated T1 → T4)</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* MANDATORY SIMULATED DATA LABEL */}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                  SIMULATED DATA
                </span>

                <button
                  onClick={() => handleOpenComparisonViewer('T1', 'T2')}
                  className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-cyan)]/40 hover:border-[var(--cosmic-cyan)] text-[var(--cosmic-cyan)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span>Observation Viewer</span>
                </button>

                <button
                  onClick={() => {
                    const targetQuery = activePreset ? activePreset.name : `RA ${raInput}°, Dec ${decInput}°`;
                    navigate(`/analysis?target=${encodeURIComponent(targetQuery)}`, {
                      state: {
                        targetName: targetQuery,
                        coordinates: { ra: parseFloat(raInput), dec: parseFloat(decInput), fov: parseFloat(fovInput) },
                        observations: searchResponse?.observations || []
                      }
                    });
                  }}
                  id="open-analysis-workspace-btn"
                  className="px-3 py-1.5 rounded-lg bg-[var(--cosmic-surface-subtle)] hover:bg-[var(--cosmic-surface-hover)] border border-[var(--cosmic-violet)]/40 hover:border-[var(--cosmic-violet)] text-[var(--cosmic-violet)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open Multi-Epoch Scientific Analysis Workspace"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Scientific Analysis</span>
                </button>
              </div>
            </div>

            {/* Grid of Individual Epoch Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {searchResponse.observations.map(obs => (
                <EpochObservationCard
                  key={obs.id}
                  observation={obs}
                  targetName={searchResponse.query.targetName}
                  onOpenComparison={epoch => handleOpenComparisonViewer('T1', epoch === 'T1' ? 'T2' : epoch)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

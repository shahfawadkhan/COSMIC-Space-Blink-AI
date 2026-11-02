import { EpochId } from './observation';

// --- Astrometric Motion -------------------------------------------------------

/** One measured position at a single epoch */
export interface AstrometricPosition {
  epoch: EpochId;
  timestamp: string;
  julianDate: number;
  ra: number;
  dec: number;
  /** Positional uncertainty radius in arcseconds, if provided by data model */
  posUncertArcsec?: number;
}

export interface AstrometricDisplacement {
  fromEpoch: EpochId;
  toEpoch: EpochId;
  deltaRaArcsec: number;
  deltaDecArcsec: number;
  totalArcsec: number;
  timeBaselineHours: number;
  /** True when data model provides enough information to compute this */
  isIllustrative: boolean;
}

export interface AstrometricAnalysisData {
  sourceId: string;
  sourceLabel: string;
  positions: AstrometricPosition[];
  displacements: AstrometricDisplacement[];
  isSimulated: boolean;
  provenanceNote: string;
}

// --- Photometric / Light Curve ------------------------------------------------

export interface PhotometricMeasurement {
  epoch: EpochId;
  timestamp: string;
  julianDate: number;
  fluxMjy: number;
  fluxErrMjy?: number;
  snr?: number;
  band: string;
  isIllustrative: boolean;
}

export interface LightCurveData {
  sourceId: string;
  sourceLabel: string;
  measurements: PhotometricMeasurement[];
  isSimulated: boolean;
  provenanceNote: string;
}

// --- Spectral SED -------------------------------------------------------------

export interface BroadBandPoint {
  bandId: string;
  bandName: string;
  wavelengthCenterMicrons: number;
  wavelengthMinMicrons: number;
  wavelengthMaxMicrons: number;
  fluxMjy: number;
  uncertaintyMjy?: number;
  isIllustrative: boolean;
}

export interface SpectralChannelPoint {
  channelIndex: number;
  bandId: string;
  wavelengthMicrons: number;
  fluxMjy: number | null;
  uncertaintyMjy?: number;
  isAvailable: boolean;
  isIllustrative: boolean;
}

export interface SpectrumData {
  sourceId: string;
  sourceLabel: string;
  broadBandPoints: BroadBandPoint[];
  channelPoints: SpectralChannelPoint[];
  hasChannelData: boolean;
  isSimulated: boolean;
  provenanceNote: string;
}

// --- Source selection ---------------------------------------------------------

export type AnalysisTab = 'astrometry' | 'lightcurve' | 'spectrum';

export interface AnalysisSource {
  id: string;
  label: string;
  ra: number;
  dec: number;
}

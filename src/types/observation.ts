export type EpochId = 'T1' | 'T2' | 'T3' | 'T4';

export interface ObservationEpoch {
  id: EpochId;
  label: string;
  timestamp: string;
  julianDate: number;
  timeBaselineFromT1Hours: number;
  description: string;
}

export interface DetectorInfo {
  instrument: string;             // e.g. "SPHEREx All-Sky Spectral Imager"
  focalPlaneArray: string;        // e.g. "H2RG SCA-101 (Band 1)"
  detectorType: string;           // e.g. "2048x2048 HgCdTe (HAWAII-2RG)"
  pixelScaleArcsec: number;       // e.g. 6.2
  operatingTemperatureK: number;  // e.g. 55.0
  gainElectronsPerAdu?: number;
  readNoiseElectrons?: number;
}

export interface ObservationMetadata {
  id: string;
  epoch: EpochId;
  timestamp: string;
  julianDate: number;
  targetRegion: string;
  centerRa: number;
  centerDec: number;
  fovDeg: number;
  filterBand: string;
  exposureSec: number;
  qualityScore: number;
  status: 'CALIBRATED_L2' | 'COADDED_L3' | 'ARCHIVED';
  simulatedTilePattern: string;
  candidatesDetected: number;
  sourcesExtracted: number;
  backgroundNoiseMjy: number;
  telescopePointingErrorArcsec: number;
  // Extended SPHEREx & archival metadata
  detector?: DetectorInfo;
  spectralChannels?: string;
  dataSource?: string;
  isSimulated?: boolean;
  fitsHeaders?: Record<string, string | number>;
}

export interface DifferenceMetric {
  candidateId: string;
  position: { ra: number; dec: number };
  apparentChange: 'MOTION_DETECTED' | 'FLUX_VARIABILITY' | 'TRANSIENT_NEW' | 'STATIONARY_SOURCE';
  displacementArcsec: number;
  fluxDifferencePercent: number;
  timeBetweenObsHours: number;
  reviewStatus: string;
  significanceSigma: number;
}

export interface SkySearchRequest {
  ra: number;              // RA in decimal degrees [0, 360]
  dec: number;             // Dec in decimal degrees [-90, +90]
  fovArcmin: number;       // FOV in arcminutes [1, 600]
  targetName?: string;     // Optional target label (e.g., from preset)
  simulateError?: boolean; // Optional flag for testing archive error state
}

export interface SkySearchResponse {
  query: SkySearchRequest;
  totalObservations: number;
  observations: ObservationMetadata[];
  searchRadiusArcmin: number;
  executionTimeMs: number;
  dataSource: string;
  isSimulated: boolean;
  message?: string;
}

export interface TargetPreset {
  id: string;
  name: string;
  designation: string;
  ra: number;
  dec: number;
  defaultFovArcmin: number;
  category: string;
  description: string;
  constellation: string;
  properMotionArcsecPerYear?: number;
}


import {
  AstrometricAnalysisData,
  LightCurveData,
  SpectrumData,
  AstrometricPosition,
} from '../types/analysis';
import { MOCK_CANDIDATES } from '../data/mockCandidates';

const PROVENANCE = 'Illustrative synthetic data — not retrieved from IRSA or any observational archive.';

// --- Build astrometric data from candidate epoch detections ------------------

function buildAstrometricData(candidateId: string): AstrometricAnalysisData | null {
  const candidate = MOCK_CANDIDATES.find(c => c.id === candidateId);
  if (!candidate || candidate.epochsDetected.length === 0) return null;

  const positions: AstrometricPosition[] = candidate.epochsDetected.map(det => ({
    epoch: det.epoch,
    timestamp: det.timestamp,
    julianDate: epochTimestampToJD(det.timestamp),
    ra: det.ra,
    dec: det.dec,
    // Only provide positional uncertainty when the detection model supplies fwhm (proxy for PSF size)
    posUncertArcsec: det.fwhmArcsec ? +(det.fwhmArcsec / 3.0).toFixed(2) : undefined,
  }));

  // Compute displacements between consecutive epochs
  const displacements = [];
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const cosDecMidRad = Math.cos(((prev.dec + curr.dec) / 2) * (Math.PI / 180));
    const dRaArcsec = (curr.ra - prev.ra) * 3600 * cosDecMidRad;
    const dDecArcsec = (curr.dec - prev.dec) * 3600;
    const totalArcsec = Math.sqrt(dRaArcsec ** 2 + dDecArcsec ** 2);
    const tBaseHrs = (curr.julianDate - prev.julianDate) * 24;
    displacements.push({
      fromEpoch: prev.epoch,
      toEpoch: curr.epoch,
      deltaRaArcsec: +dRaArcsec.toFixed(3),
      deltaDecArcsec: +dDecArcsec.toFixed(3),
      totalArcsec: +totalArcsec.toFixed(3),
      timeBaselineHours: +tBaseHrs.toFixed(2),
      isIllustrative: true,
    });
  }

  return {
    sourceId: candidateId,
    sourceLabel: candidateId,
    positions,
    displacements,
    isSimulated: true,
    provenanceNote: PROVENANCE,
  };
}

// --- Build light curve data from candidate epoch detections ------------------

function buildLightCurveData(candidateId: string): LightCurveData | null {
  const candidate = MOCK_CANDIDATES.find(c => c.id === candidateId);
  if (!candidate || candidate.epochsDetected.length === 0) return null;

  const measurements = candidate.epochsDetected.map(det => ({
    epoch: det.epoch,
    timestamp: det.timestamp,
    julianDate: epochTimestampToJD(det.timestamp),
    fluxMjy: det.fluxMjy,
    fluxErrMjy: det.fluxErr,
    snr: det.snr,
    band: 'SPHEREx Band 1 (0.75–1.11 µm)',
    isIllustrative: true,
  }));

  return {
    sourceId: candidateId,
    sourceLabel: candidateId,
    measurements,
    isSimulated: true,
    provenanceNote: PROVENANCE,
  };
}

// --- Build spectral SED data from candidate spectral bands ------------------

const BAND_META = [
  { bandId: 'band1', bandName: 'SPHEREx Band 1', wMin: 0.75, wMax: 1.11, wCenter: 0.93 },
  { bandId: 'band2', bandName: 'SPHEREx Band 2', wMin: 1.11, wMax: 1.64, wCenter: 1.38 },
  { bandId: 'band3', bandName: 'SPHEREx Band 3', wMin: 1.64, wMax: 2.42, wCenter: 2.03 },
  { bandId: 'band4', bandName: 'SPHEREx Band 4', wMin: 2.42, wMax: 3.82, wCenter: 3.12 },
  { bandId: 'band5', bandName: 'SPHEREx Band 5', wMin: 3.82, wMax: 4.42, wCenter: 4.12 },
  { bandId: 'band6', bandName: 'SPHEREx Band 6', wMin: 4.42, wMax: 5.00, wCenter: 4.71 },
];

function buildSpectrumData(candidateId: string): SpectrumData | null {
  const candidate = MOCK_CANDIDATES.find(c => c.id === candidateId);
  if (!candidate) return null;

  const broadBandPoints = candidate.spectralBands.map((sp, i) => {
    const meta = BAND_META[i] || BAND_META[0];
    return {
      bandId: meta.bandId,
      bandName: sp.band,
      wavelengthCenterMicrons: sp.wavelengthMicrons,
      wavelengthMinMicrons: meta.wMin,
      wavelengthMaxMicrons: meta.wMax,
      fluxMjy: sp.fluxMjy,
      uncertaintyMjy: sp.uncertainty,
      isIllustrative: true,
    };
  });

  // Channel-level data: only illustrate the channels covered by Band 1 (1–17)
  // because the candidate data model only samples one spectral window.
  // All other channels are explicitly marked unavailable.
  const channelPoints = Array.from({ length: 102 }, (_, i) => {
    const chIdx = i + 1;
    const isInBand1 = chIdx >= 1 && chIdx <= 17;
    const bb = broadBandPoints[0];
    const wl = isInBand1 ? 0.75 + (chIdx - 1) * ((1.11 - 0.75) / 16) : null;
    // Only simulate flux for band-1 channels, everything else is unavailable
    return {
      channelIndex: chIdx,
      bandId: chIdx <= 17 ? 'band1' : chIdx <= 34 ? 'band2' : chIdx <= 51 ? 'band3' : chIdx <= 68 ? 'band4' : chIdx <= 85 ? 'band5' : 'band6',
      wavelengthMicrons: wl ?? (0.75 + i * 0.042),
      fluxMjy: isInBand1 && bb ? +(bb.fluxMjy + (Math.sin(chIdx * 0.4) * bb.uncertaintyMjy * 2)).toFixed(4) : null,
      uncertaintyMjy: isInBand1 && bb ? bb.uncertaintyMjy : undefined,
      isAvailable: isInBand1,
      isIllustrative: true,
    };
  });

  return {
    sourceId: candidateId,
    sourceLabel: candidateId,
    broadBandPoints,
    channelPoints,
    hasChannelData: false, // channel data not provided by data model; only broad-band illustrated
    isSimulated: true,
    provenanceNote: PROVENANCE,
  };
}

// --- Utilities ----------------------------------------------------------------

function epochTimestampToJD(iso: string): number {
  // Approximate JD from ISO timestamp
  const ms = new Date(iso).getTime();
  return ms / 86400000 + 2440587.5;
}

// --- Exported getters ---------------------------------------------------------

export function getMockAstrometricData(candidateId: string): AstrometricAnalysisData | null {
  return buildAstrometricData(candidateId);
}

export function getMockLightCurveData(candidateId: string): LightCurveData | null {
  return buildLightCurveData(candidateId);
}

export function getMockSpectrumData(candidateId: string): SpectrumData | null {
  return buildSpectrumData(candidateId);
}

export function getMockAnalysisSources() {
  return MOCK_CANDIDATES.map(c => ({
    id: c.id,
    label: c.id,
    ra: c.ra,
    dec: c.dec,
  }));
}


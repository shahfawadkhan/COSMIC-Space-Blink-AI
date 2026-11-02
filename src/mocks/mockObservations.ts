import {
  ObservationEpoch,
  ObservationMetadata,
  DifferenceMetric,
  SkySearchRequest,
  SkySearchResponse,
  DetectorInfo
} from '../types/observation';
import { TARGET_PRESETS, findMatchingPreset } from './presets';

// Standard SPHEREx Cryogenic Focal Plane Array specification
const SPHEREX_DETECTORS: Record<string, DetectorInfo> = {
  band1: {
    instrument: 'SPHEREx All-Sky Spectral Imager',
    focalPlaneArray: 'H2RG SCA-101 (Band 1: 0.75 - 1.11 µm)',
    detectorType: '2048×2048 HgCdTe (HAWAII-2RG, 2.5µm cutoff)',
    pixelScaleArcsec: 6.2,
    operatingTemperatureK: 55.0,
    gainElectronsPerAdu: 2.1,
    readNoiseElectrons: 11.8
  },
  band2: {
    instrument: 'SPHEREx All-Sky Spectral Imager',
    focalPlaneArray: 'H2RG SCA-102 (Band 2: 1.11 - 1.64 µm)',
    detectorType: '2048×2048 HgCdTe (HAWAII-2RG, 2.5µm cutoff)',
    pixelScaleArcsec: 6.2,
    operatingTemperatureK: 55.0,
    gainElectronsPerAdu: 2.0,
    readNoiseElectrons: 12.2
  },
  band3: {
    instrument: 'SPHEREx All-Sky Spectral Imager',
    focalPlaneArray: 'H2RG SCA-103 (Band 3: 1.64 - 2.42 µm)',
    detectorType: '2048×2048 HgCdTe (HAWAII-2RG, 2.5µm cutoff)',
    pixelScaleArcsec: 6.2,
    operatingTemperatureK: 55.0,
    gainElectronsPerAdu: 2.2,
    readNoiseElectrons: 12.0
  },
  band4: {
    instrument: 'SPHEREx All-Sky Spectral Imager',
    focalPlaneArray: 'H2RG SCA-104 (Band 4: 2.42 - 3.82 µm)',
    detectorType: '2048×2048 HgCdTe (HAWAII-2RG, 5.3µm cutoff)',
    pixelScaleArcsec: 6.2,
    operatingTemperatureK: 55.0,
    gainElectronsPerAdu: 1.9,
    readNoiseElectrons: 14.5
  },
  band5: {
    instrument: 'SPHEREx All-Sky Spectral Imager',
    focalPlaneArray: 'H2RG SCA-105 (Band 5: 3.82 - 4.42 µm)',
    detectorType: '2048×2048 HgCdTe (HAWAII-2RG, 5.3µm cutoff)',
    pixelScaleArcsec: 6.2,
    operatingTemperatureK: 55.0,
    gainElectronsPerAdu: 1.8,
    readNoiseElectrons: 15.0
  },
  band6: {
    instrument: 'SPHEREx All-Sky Spectral Imager',
    focalPlaneArray: 'H2RG SCA-106 (Band 6: 4.42 - 5.00 µm)',
    detectorType: '2048×2048 HgCdTe (HAWAII-2RG, 5.3µm cutoff)',
    pixelScaleArcsec: 6.2,
    operatingTemperatureK: 55.0,
    gainElectronsPerAdu: 1.7,
    readNoiseElectrons: 16.2
  }
};

export const MOCK_EPOCHS: ObservationEpoch[] = [
  {
    id: 'T1',
    label: 'Epoch 1 (Initial Survey)',
    timestamp: '2025-03-12T04:15:22Z',
    julianDate: 2460746.6773,
    timeBaselineFromT1Hours: 0,
    description: 'First scheduled sweep across North Ecliptic Pole deep calibration tile NEP-04.'
  },
  {
    id: 'T2',
    label: 'Epoch 2 (+55.2 Hours)',
    timestamp: '2025-03-14T11:30:10Z',
    julianDate: 2460748.9793,
    timeBaselineFromT1Hours: 55.25,
    description: 'Second sweep. First anomalous displacement detected on target candidate CSB-2025-089A.'
  },
  {
    id: 'T3',
    label: 'Epoch 3 (+118.5 Hours)',
    timestamp: '2025-03-17T02:45:44Z',
    julianDate: 2460751.6151,
    timeBaselineFromT1Hours: 118.5,
    description: 'Third sweep confirming linear astrometric trajectory and spectral color consistency.'
  },
  {
    id: 'T4',
    label: 'Epoch 4 (+230.1 Hours)',
    timestamp: '2025-03-21T18:20:15Z',
    julianDate: 2460756.2641,
    timeBaselineFromT1Hours: 230.1,
    description: 'Fourth sweep providing a 9.6-day baseline for high-precision orbit determination.'
  }
];

export const MOCK_OBSERVATIONS: ObservationMetadata[] = [
  {
    id: 'SPHX-2025-NEP04-T1',
    epoch: 'T1',
    timestamp: '2025-03-12T04:15:22Z',
    julianDate: 2460746.6773,
    targetRegion: 'North Ecliptic Pole Field NEP-04',
    centerRa: 270.2842,
    centerDec: 66.5714,
    fovDeg: 1.25,
    filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
    spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
    exposureSec: 180.0,
    qualityScore: 98.4,
    status: 'CALIBRATED_L2',
    simulatedTilePattern: 'tile-nep04-t1',
    candidatesDetected: 14,
    sourcesExtracted: 4820,
    backgroundNoiseMjy: 0.042,
    telescopePointingErrorArcsec: 0.12,
    detector: SPHEREX_DETECTORS.band1,
    dataSource: 'Synthetic test data — not retrieved from IRSA.',
    isSimulated: true,
    fitsHeaders: {
      TELESCOP: 'SPHEREx All-Sky Surveyor',
      INSTRUME: 'Spectral Imaging Focal Plane',
      DETNAME: 'SCA-101',
      OBS_DATE: '2025-03-12T04:15:22Z',
      EQUINOX: 2000.0,
      RADESYS: 'ICRS',
      CRVAL1: 270.2842,
      CRVAL2: 66.5714,
      CDELT1: -0.001722,
      CDELT2: 0.001722,
      BUNIT: 'MJy/sr',
      EXPTIME: 180.0,
      CCDTEMP: 55.0
    }
  },
  {
    id: 'SPHX-2025-NEP04-T2',
    epoch: 'T2',
    timestamp: '2025-03-14T11:30:10Z',
    julianDate: 2460748.9793,
    targetRegion: 'North Ecliptic Pole Field NEP-04',
    centerRa: 270.2840,
    centerDec: 66.5716,
    fovDeg: 1.25,
    filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
    spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
    exposureSec: 180.0,
    qualityScore: 97.9,
    status: 'CALIBRATED_L2',
    simulatedTilePattern: 'tile-nep04-t2',
    candidatesDetected: 18,
    sourcesExtracted: 4835,
    backgroundNoiseMjy: 0.045,
    telescopePointingErrorArcsec: 0.14,
    detector: SPHEREX_DETECTORS.band1,
    dataSource: 'Synthetic test data — not retrieved from IRSA.',
    isSimulated: true,
    fitsHeaders: {
      TELESCOP: 'SPHEREx All-Sky Surveyor',
      INSTRUME: 'Spectral Imaging Focal Plane',
      DETNAME: 'SCA-101',
      OBS_DATE: '2025-03-14T11:30:10Z',
      EQUINOX: 2000.0,
      RADESYS: 'ICRS',
      CRVAL1: 270.2840,
      CRVAL2: 66.5716,
      CDELT1: -0.001722,
      CDELT2: 0.001722,
      BUNIT: 'MJy/sr',
      EXPTIME: 180.0,
      CCDTEMP: 55.0
    }
  },
  {
    id: 'SPHX-2025-NEP04-T3',
    epoch: 'T3',
    timestamp: '2025-03-17T02:45:44Z',
    julianDate: 2460751.6151,
    targetRegion: 'North Ecliptic Pole Field NEP-04',
    centerRa: 270.2845,
    centerDec: 66.5712,
    fovDeg: 1.25,
    filterBand: 'SPHEREx Band 2 (1.11 - 1.64 µm)',
    spectralChannels: 'Channels 18–34 (R = λ/Δλ ≈ 41)',
    exposureSec: 210.0,
    qualityScore: 99.1,
    status: 'COADDED_L3',
    simulatedTilePattern: 'tile-nep04-t3',
    candidatesDetected: 15,
    sourcesExtracted: 4910,
    backgroundNoiseMjy: 0.039,
    telescopePointingErrorArcsec: 0.09,
    detector: SPHEREX_DETECTORS.band2,
    dataSource: 'Synthetic test data — not retrieved from IRSA.',
    isSimulated: true,
    fitsHeaders: {
      TELESCOP: 'SPHEREx All-Sky Surveyor',
      INSTRUME: 'Spectral Imaging Focal Plane',
      DETNAME: 'SCA-102',
      OBS_DATE: '2025-03-17T02:45:44Z',
      EQUINOX: 2000.0,
      RADESYS: 'ICRS',
      CRVAL1: 270.2845,
      CRVAL2: 66.5712,
      CDELT1: -0.001722,
      CDELT2: 0.001722,
      BUNIT: 'MJy/sr',
      EXPTIME: 210.0,
      CCDTEMP: 55.0
    }
  },
  {
    id: 'SPHX-2025-NEP04-T4',
    epoch: 'T4',
    timestamp: '2025-03-21T18:20:15Z',
    julianDate: 2460756.2641,
    targetRegion: 'North Ecliptic Pole Field NEP-04',
    centerRa: 270.2841,
    centerDec: 66.5715,
    fovDeg: 1.25,
    filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
    spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
    exposureSec: 240.0,
    qualityScore: 98.8,
    status: 'COADDED_L3',
    simulatedTilePattern: 'tile-nep04-t4',
    candidatesDetected: 16,
    sourcesExtracted: 4890,
    backgroundNoiseMjy: 0.041,
    telescopePointingErrorArcsec: 0.11,
    detector: SPHEREX_DETECTORS.band3,
    dataSource: 'Synthetic test data — not retrieved from IRSA.',
    isSimulated: true,
    fitsHeaders: {
      TELESCOP: 'SPHEREx All-Sky Surveyor',
      INSTRUME: 'Spectral Imaging Focal Plane',
      DETNAME: 'SCA-103',
      OBS_DATE: '2025-03-21T18:20:15Z',
      EQUINOX: 2000.0,
      RADESYS: 'ICRS',
      CRVAL1: 270.2841,
      CRVAL2: 66.5715,
      CDELT1: -0.001722,
      CDELT2: 0.001722,
      BUNIT: 'MJy/sr',
      EXPTIME: 240.0,
      CCDTEMP: 55.0
    }
  }
];

export const MOCK_DIFFERENCE_METRICS: DifferenceMetric[] = [
  {
    candidateId: 'CSB-2025-089A',
    position: { ra: 270.3421, dec: 66.5912 },
    apparentChange: 'MOTION_DETECTED',
    displacementArcsec: 84.6,
    fluxDifferencePercent: 12.4,
    timeBetweenObsHours: 55.25,
    reviewStatus: 'Needs Review',
    significanceSigma: 18.4
  },
  {
    candidateId: 'CSB-2025-104B',
    position: { ra: 270.1982, dec: 66.5234 },
    apparentChange: 'MOTION_DETECTED',
    displacementArcsec: 61.2,
    fluxDifferencePercent: -8.1,
    timeBetweenObsHours: 55.25,
    reviewStatus: 'Under Investigation',
    significanceSigma: 14.8
  },
  {
    candidateId: 'CSB-2025-077C',
    position: { ra: 270.4120, dec: 66.6341 },
    apparentChange: 'FLUX_VARIABILITY',
    displacementArcsec: 1.1,
    fluxDifferencePercent: 142.5,
    timeBetweenObsHours: 55.25,
    reviewStatus: 'Needs Review',
    significanceSigma: 9.2
  },
  {
    candidateId: 'CSB-2025-092D',
    position: { ra: 270.1250, dec: 66.4890 },
    apparentChange: 'MOTION_DETECTED',
    displacementArcsec: 39.8,
    fluxDifferencePercent: 4.2,
    timeBetweenObsHours: 55.25,
    reviewStatus: 'Known Object Match',
    significanceSigma: 22.1
  },
  {
    candidateId: 'CSB-2025-055E',
    position: { ra: 270.2915, dec: 66.5410 },
    apparentChange: 'STATIONARY_SOURCE',
    displacementArcsec: 0.2,
    fluxDifferencePercent: 0.8,
    timeBetweenObsHours: 55.25,
    reviewStatus: 'Archived',
    significanceSigma: 1.1
  }
];

/**
 * Curated multi-epoch observation sequences for the 5 requested preset targets.
 * All observation footprints reflect simulated SPHEREx survey cadence sweeps.
 */
function generatePresetObservations(presetId: string, ra: number, dec: number, fovArcmin: number): ObservationMetadata[] {
  const fovDeg = fovArcmin / 60;
  const commonDataSource = 'Synthetic test data — not retrieved from IRSA.';

  switch (presetId) {
    case 'barnards-star':
      return [
        {
          id: 'SPHX-SIM-BARNARD-T1',
          epoch: 'T1',
          timestamp: '2025-04-02T08:14:10Z',
          julianDate: 2460767.8432,
          targetRegion: "Barnard's Star Field (GJ 699)",
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
          spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
          exposureSec: 180.0,
          qualityScore: 98.7,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-barnard-t1',
          candidatesDetected: 2,
          sourcesExtracted: 3120,
          backgroundNoiseMjy: 0.038,
          telescopePointingErrorArcsec: 0.11,
          detector: SPHEREX_DETECTORS.band1,
          dataSource: commonDataSource,
          isSimulated: true,
          fitsHeaders: {
            TELESCOP: 'SPHEREx All-Sky Surveyor',
            INSTRUME: 'Spectral Imaging Focal Plane',
            DETNAME: 'SCA-101',
            TARGET: "Barnard's Star (GJ 699)",
            CRVAL1: ra,
            CRVAL2: dec,
            EXPTIME: 180.0,
            CCDTEMP: 55.0
          }
        },
        {
          id: 'SPHX-SIM-BARNARD-T2',
          epoch: 'T2',
          timestamp: '2025-04-04T19:42:25Z',
          julianDate: 2460770.3211,
          targetRegion: "Barnard's Star Field (GJ 699)",
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
          spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
          exposureSec: 180.0,
          qualityScore: 98.2,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-barnard-t2',
          candidatesDetected: 3,
          sourcesExtracted: 3140,
          backgroundNoiseMjy: 0.040,
          telescopePointingErrorArcsec: 0.13,
          detector: SPHEREX_DETECTORS.band1,
          dataSource: commonDataSource,
          isSimulated: true,
          fitsHeaders: {
            TELESCOP: 'SPHEREx All-Sky Surveyor',
            INSTRUME: 'Spectral Imaging Focal Plane',
            DETNAME: 'SCA-101',
            TARGET: "Barnard's Star (GJ 699)",
            CRVAL1: ra,
            CRVAL2: dec,
            EXPTIME: 180.0,
            CCDTEMP: 55.0
          }
        },
        {
          id: 'SPHX-SIM-BARNARD-T3',
          epoch: 'T3',
          timestamp: '2025-04-08T03:10:05Z',
          julianDate: 2460773.6320,
          targetRegion: "Barnard's Star Field (GJ 699)",
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 2 (1.11 - 1.64 µm)',
          spectralChannels: 'Channels 18–34 (R = λ/Δλ ≈ 41)',
          exposureSec: 210.0,
          qualityScore: 99.4,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-barnard-t3',
          candidatesDetected: 2,
          sourcesExtracted: 3210,
          backgroundNoiseMjy: 0.035,
          telescopePointingErrorArcsec: 0.08,
          detector: SPHEREX_DETECTORS.band2,
          dataSource: commonDataSource,
          isSimulated: true,
          fitsHeaders: {
            TELESCOP: 'SPHEREx All-Sky Surveyor',
            INSTRUME: 'Spectral Imaging Focal Plane',
            DETNAME: 'SCA-102',
            TARGET: "Barnard's Star (GJ 699)",
            CRVAL1: ra,
            CRVAL2: dec,
            EXPTIME: 210.0,
            CCDTEMP: 55.0
          }
        },
        {
          id: 'SPHX-SIM-BARNARD-T4',
          epoch: 'T4',
          timestamp: '2025-04-14T14:28:40Z',
          julianDate: 2460780.1032,
          targetRegion: "Barnard's Star Field (GJ 699)",
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
          spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 99.0,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-barnard-t4',
          candidatesDetected: 2,
          sourcesExtracted: 3180,
          backgroundNoiseMjy: 0.037,
          telescopePointingErrorArcsec: 0.10,
          detector: SPHEREX_DETECTORS.band3,
          dataSource: commonDataSource,
          isSimulated: true,
          fitsHeaders: {
            TELESCOP: 'SPHEREx All-Sky Surveyor',
            INSTRUME: 'Spectral Imaging Focal Plane',
            DETNAME: 'SCA-103',
            TARGET: "Barnard's Star (GJ 699)",
            CRVAL1: ra,
            CRVAL2: dec,
            EXPTIME: 240.0,
            CCDTEMP: 55.0
          }
        }
      ];

    case 'epsilon-indi-b':
      return [
        {
          id: 'SPHX-SIM-EPSIND-T1',
          epoch: 'T1',
          timestamp: '2025-05-10T12:05:30Z',
          julianDate: 2460806.0038,
          targetRegion: 'Epsilon Indi Field (ε Ind Ba/Bb)',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
          spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
          exposureSec: 200.0,
          qualityScore: 97.9,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-epsind-t1',
          candidatesDetected: 4,
          sourcesExtracted: 2890,
          backgroundNoiseMjy: 0.044,
          telescopePointingErrorArcsec: 0.14,
          detector: SPHEREX_DETECTORS.band3,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-EPSIND-T2',
          epoch: 'T2',
          timestamp: '2025-05-12T20:15:00Z',
          julianDate: 2460808.3438,
          targetRegion: 'Epsilon Indi Field (ε Ind Ba/Bb)',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
          spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
          exposureSec: 200.0,
          qualityScore: 98.1,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-epsind-t2',
          candidatesDetected: 4,
          sourcesExtracted: 2910,
          backgroundNoiseMjy: 0.043,
          telescopePointingErrorArcsec: 0.12,
          detector: SPHEREX_DETECTORS.band3,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-EPSIND-T3',
          epoch: 'T3',
          timestamp: '2025-05-16T09:40:15Z',
          julianDate: 2460811.9029,
          targetRegion: 'Epsilon Indi Field (ε Ind Ba/Bb)',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 4 (2.42 - 3.82 µm)',
          spectralChannels: 'Channels 52–68 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 99.2,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-epsind-t3',
          candidatesDetected: 3,
          sourcesExtracted: 2950,
          backgroundNoiseMjy: 0.038,
          telescopePointingErrorArcsec: 0.09,
          detector: SPHEREX_DETECTORS.band4,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-EPSIND-T4',
          epoch: 'T4',
          timestamp: '2025-05-23T18:50:42Z',
          julianDate: 2460819.2852,
          targetRegion: 'Epsilon Indi Field (ε Ind Ba/Bb)',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 5 (3.82 - 4.42 µm)',
          spectralChannels: 'Channels 69–85 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 98.6,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-epsind-t4',
          candidatesDetected: 3,
          sourcesExtracted: 2920,
          backgroundNoiseMjy: 0.042,
          telescopePointingErrorArcsec: 0.11,
          detector: SPHEREX_DETECTORS.band5,
          dataSource: commonDataSource,
          isSimulated: true
        }
      ];

    case 'wise-0855':
      return [
        {
          id: 'SPHX-SIM-W0855-T1',
          epoch: 'T1',
          timestamp: '2025-02-18T01:30:12Z',
          julianDate: 2460724.5626,
          targetRegion: 'WISE 0855-0714 Infrared Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 4 (2.42 - 3.82 µm)',
          spectralChannels: 'Channels 52–68 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 98.5,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-w0855-t1',
          candidatesDetected: 1,
          sourcesExtracted: 1840,
          backgroundNoiseMjy: 0.036,
          telescopePointingErrorArcsec: 0.10,
          detector: SPHEREX_DETECTORS.band4,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-W0855-T2',
          epoch: 'T2',
          timestamp: '2025-02-20T11:15:45Z',
          julianDate: 2460726.9693,
          targetRegion: 'WISE 0855-0714 Infrared Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 4 (2.42 - 3.82 µm)',
          spectralChannels: 'Channels 52–68 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 97.8,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-w0855-t2',
          candidatesDetected: 1,
          sourcesExtracted: 1855,
          backgroundNoiseMjy: 0.039,
          telescopePointingErrorArcsec: 0.12,
          detector: SPHEREX_DETECTORS.band4,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-W0855-T3',
          epoch: 'T3',
          timestamp: '2025-02-24T22:05:00Z',
          julianDate: 2460731.4201,
          targetRegion: 'WISE 0855-0714 Infrared Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 5 (3.82 - 4.42 µm)',
          spectralChannels: 'Channels 69–85 (R = λ/Δλ ≈ 41)',
          exposureSec: 270.0,
          qualityScore: 99.1,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-w0855-t3',
          candidatesDetected: 1,
          sourcesExtracted: 1890,
          backgroundNoiseMjy: 0.033,
          telescopePointingErrorArcsec: 0.08,
          detector: SPHEREX_DETECTORS.band5,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-W0855-T4',
          epoch: 'T4',
          timestamp: '2025-03-03T16:40:20Z',
          julianDate: 2460738.1947,
          targetRegion: 'WISE 0855-0714 Infrared Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 6 (4.42 - 5.00 µm)',
          spectralChannels: 'Channels 86–102 (R = λ/Δλ ≈ 41)',
          exposureSec: 300.0,
          qualityScore: 98.9,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-w0855-t4',
          candidatesDetected: 1,
          sourcesExtracted: 1860,
          backgroundNoiseMjy: 0.037,
          telescopePointingErrorArcsec: 0.09,
          detector: SPHEREX_DETECTORS.band6,
          dataSource: commonDataSource,
          isSimulated: true
        }
      ];

    case 'rw-aurigae':
      return [
        {
          id: 'SPHX-SIM-RWAUR-T1',
          epoch: 'T1',
          timestamp: '2025-01-14T22:10:00Z',
          julianDate: 2460689.9236,
          targetRegion: 'RW Aurigae Variable Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 2 (1.11 - 1.64 µm)',
          spectralChannels: 'Channels 18–34 (R = λ/Δλ ≈ 41)',
          exposureSec: 180.0,
          qualityScore: 98.9,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-rwaur-t1',
          candidatesDetected: 5,
          sourcesExtracted: 4120,
          backgroundNoiseMjy: 0.041,
          telescopePointingErrorArcsec: 0.11,
          detector: SPHEREX_DETECTORS.band2,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-RWAUR-T2',
          epoch: 'T2',
          timestamp: '2025-01-17T06:45:15Z',
          julianDate: 2460692.2814,
          targetRegion: 'RW Aurigae Variable Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 2 (1.11 - 1.64 µm)',
          spectralChannels: 'Channels 18–34 (R = λ/Δλ ≈ 41)',
          exposureSec: 180.0,
          qualityScore: 98.4,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-rwaur-t2',
          candidatesDetected: 6,
          sourcesExtracted: 4145,
          backgroundNoiseMjy: 0.043,
          telescopePointingErrorArcsec: 0.13,
          detector: SPHEREX_DETECTORS.band2,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-RWAUR-T3',
          epoch: 'T3',
          timestamp: '2025-01-21T18:20:30Z',
          julianDate: 2460696.7642,
          targetRegion: 'RW Aurigae Variable Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
          spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
          exposureSec: 210.0,
          qualityScore: 99.3,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-rwaur-t3',
          candidatesDetected: 5,
          sourcesExtracted: 4210,
          backgroundNoiseMjy: 0.038,
          telescopePointingErrorArcsec: 0.08,
          detector: SPHEREX_DETECTORS.band3,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-RWAUR-T4',
          epoch: 'T4',
          timestamp: '2025-01-29T10:05:50Z',
          julianDate: 2460704.4207,
          targetRegion: 'RW Aurigae Variable Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 4 (2.42 - 3.82 µm)',
          spectralChannels: 'Channels 52–68 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 99.0,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-rwaur-t4',
          candidatesDetected: 5,
          sourcesExtracted: 4190,
          backgroundNoiseMjy: 0.039,
          telescopePointingErrorArcsec: 0.10,
          detector: SPHEREX_DETECTORS.band4,
          dataSource: commonDataSource,
          isSimulated: true
        }
      ];

    case 'r-draconis':
      return [
        {
          id: 'SPHX-SIM-RDRA-T1',
          epoch: 'T1',
          timestamp: '2025-06-05T03:40:22Z',
          julianDate: 2460831.6530,
          targetRegion: 'R Draconis Mira Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
          spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
          exposureSec: 180.0,
          qualityScore: 99.2,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-rdra-t1',
          candidatesDetected: 3,
          sourcesExtracted: 3680,
          backgroundNoiseMjy: 0.037,
          telescopePointingErrorArcsec: 0.09,
          detector: SPHEREX_DETECTORS.band1,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-RDRA-T2',
          epoch: 'T2',
          timestamp: '2025-06-07T14:15:10Z',
          julianDate: 2460834.0939,
          targetRegion: 'R Draconis Mira Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
          spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
          exposureSec: 180.0,
          qualityScore: 98.8,
          status: 'CALIBRATED_L2',
          simulatedTilePattern: 'tile-rdra-t2',
          candidatesDetected: 3,
          sourcesExtracted: 3710,
          backgroundNoiseMjy: 0.040,
          telescopePointingErrorArcsec: 0.11,
          detector: SPHEREX_DETECTORS.band1,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-RDRA-T3',
          epoch: 'T3',
          timestamp: '2025-06-12T00:50:45Z',
          julianDate: 2460838.5352,
          targetRegion: 'R Draconis Mira Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 2 (1.11 - 1.64 µm)',
          spectralChannels: 'Channels 18–34 (R = λ/Δλ ≈ 41)',
          exposureSec: 210.0,
          qualityScore: 99.5,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-rdra-t3',
          candidatesDetected: 4,
          sourcesExtracted: 3790,
          backgroundNoiseMjy: 0.034,
          telescopePointingErrorArcsec: 0.07,
          detector: SPHEREX_DETECTORS.band2,
          dataSource: commonDataSource,
          isSimulated: true
        },
        {
          id: 'SPHX-SIM-RDRA-T4',
          epoch: 'T4',
          timestamp: '2025-06-19T19:30:00Z',
          julianDate: 2460846.3125,
          targetRegion: 'R Draconis Mira Field',
          centerRa: ra,
          centerDec: dec,
          fovDeg,
          filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
          spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
          exposureSec: 240.0,
          qualityScore: 99.1,
          status: 'COADDED_L3',
          simulatedTilePattern: 'tile-rdra-t4',
          candidatesDetected: 3,
          sourcesExtracted: 3740,
          backgroundNoiseMjy: 0.036,
          telescopePointingErrorArcsec: 0.09,
          detector: SPHEREX_DETECTORS.band3,
          dataSource: commonDataSource,
          isSimulated: true
        }
      ];

    default:
      return [];
  }
}

/**
 * Synthesizes a realistic 4-epoch observation sequence for any arbitrary celestial coordinates.
 */
function synthesizeCoordinateObservations(ra: number, dec: number, fovArcmin: number, targetName?: string): ObservationMetadata[] {
  const fovDeg = fovArcmin / 60;
  const commonDataSource = 'Synthetic test data — not retrieved from IRSA.';
  const label = targetName || `Survey Pointing (RA ${ra.toFixed(4)}°, Dec ${dec >= 0 ? '+' : ''}${dec.toFixed(4)}°)`;
  const sanitizedId = `SPHX-SIM-${Math.round(ra * 10)}-${Math.round(Math.abs(dec) * 10)}`;

  return [
    {
      id: `${sanitizedId}-T1`,
      epoch: 'T1',
      timestamp: '2025-03-12T04:15:22Z',
      julianDate: 2460746.6773,
      targetRegion: label,
      centerRa: ra,
      centerDec: dec,
      fovDeg,
      filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
      spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
      exposureSec: 180.0,
      qualityScore: 98.4,
      status: 'CALIBRATED_L2',
      simulatedTilePattern: `tile-${sanitizedId}-t1`,
      candidatesDetected: 2,
      sourcesExtracted: 3420,
      backgroundNoiseMjy: 0.042,
      telescopePointingErrorArcsec: 0.12,
      detector: SPHEREX_DETECTORS.band1,
      dataSource: commonDataSource,
      isSimulated: true,
      fitsHeaders: {
        TELESCOP: 'SPHEREx All-Sky Surveyor',
        INSTRUME: 'Spectral Imaging Focal Plane',
        DETNAME: 'SCA-101',
        TARGET: label,
        CRVAL1: ra,
        CRVAL2: dec,
        EXPTIME: 180.0,
        CCDTEMP: 55.0
      }
    },
    {
      id: `${sanitizedId}-T2`,
      epoch: 'T2',
      timestamp: '2025-03-14T11:30:10Z',
      julianDate: 2460748.9793,
      targetRegion: label,
      centerRa: ra,
      centerDec: dec,
      fovDeg,
      filterBand: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
      spectralChannels: 'Channels 1–17 (R = λ/Δλ ≈ 41)',
      exposureSec: 180.0,
      qualityScore: 97.9,
      status: 'CALIBRATED_L2',
      simulatedTilePattern: `tile-${sanitizedId}-t2`,
      candidatesDetected: 3,
      sourcesExtracted: 3450,
      backgroundNoiseMjy: 0.045,
      telescopePointingErrorArcsec: 0.14,
      detector: SPHEREX_DETECTORS.band1,
      dataSource: commonDataSource,
      isSimulated: true,
      fitsHeaders: {
        TELESCOP: 'SPHEREx All-Sky Surveyor',
        INSTRUME: 'Spectral Imaging Focal Plane',
        DETNAME: 'SCA-101',
        TARGET: label,
        CRVAL1: ra,
        CRVAL2: dec,
        EXPTIME: 180.0,
        CCDTEMP: 55.0
      }
    },
    {
      id: `${sanitizedId}-T3`,
      epoch: 'T3',
      timestamp: '2025-03-17T02:45:44Z',
      julianDate: 2460751.6151,
      targetRegion: label,
      centerRa: ra,
      centerDec: dec,
      fovDeg,
      filterBand: 'SPHEREx Band 2 (1.11 - 1.64 µm)',
      spectralChannels: 'Channels 18–34 (R = λ/Δλ ≈ 41)',
      exposureSec: 210.0,
      qualityScore: 99.1,
      status: 'COADDED_L3',
      simulatedTilePattern: `tile-${sanitizedId}-t3`,
      candidatesDetected: 2,
      sourcesExtracted: 3510,
      backgroundNoiseMjy: 0.039,
      telescopePointingErrorArcsec: 0.09,
      detector: SPHEREX_DETECTORS.band2,
      dataSource: commonDataSource,
      isSimulated: true,
      fitsHeaders: {
        TELESCOP: 'SPHEREx All-Sky Surveyor',
        INSTRUME: 'Spectral Imaging Focal Plane',
        DETNAME: 'SCA-102',
        TARGET: label,
        CRVAL1: ra,
        CRVAL2: dec,
        EXPTIME: 210.0,
        CCDTEMP: 55.0
      }
    },
    {
      id: `${sanitizedId}-T4`,
      epoch: 'T4',
      timestamp: '2025-03-21T18:20:15Z',
      julianDate: 2460756.2641,
      targetRegion: label,
      centerRa: ra,
      centerDec: dec,
      fovDeg,
      filterBand: 'SPHEREx Band 3 (1.64 - 2.42 µm)',
      spectralChannels: 'Channels 35–51 (R = λ/Δλ ≈ 41)',
      exposureSec: 240.0,
      qualityScore: 98.8,
      status: 'COADDED_L3',
      simulatedTilePattern: `tile-${sanitizedId}-t4`,
      candidatesDetected: 2,
      sourcesExtracted: 3490,
      backgroundNoiseMjy: 0.041,
      telescopePointingErrorArcsec: 0.11,
      detector: SPHEREX_DETECTORS.band3,
      dataSource: commonDataSource,
      isSimulated: true,
      fitsHeaders: {
        TELESCOP: 'SPHEREx All-Sky Surveyor',
        INSTRUME: 'Spectral Imaging Focal Plane',
        DETNAME: 'SCA-103',
        TARGET: label,
        CRVAL1: ra,
        CRVAL2: dec,
        EXPTIME: 240.0,
        CCDTEMP: 55.0
      }
    }
  ];
}

/**
 * Searches the simulated observation catalog for a requested RA, Dec, and FOV.
 */
export function findMockObservations(request: SkySearchRequest): SkySearchResponse {
  const { ra, dec, fovArcmin, targetName } = request;

  // Designated unobserved sky gap for testing the Empty State:
  // Coordinates (0.0, 0.0) or targetName marked as 'empty-test' return 0 observations
  const isEmptyTest = (Math.abs(ra) < 0.001 && Math.abs(dec) < 0.001) || targetName === 'Empty Test Field';
  if (isEmptyTest) {
    return {
      query: request,
      totalObservations: 0,
      observations: [],
      searchRadiusArcmin: fovArcmin,
      executionTimeMs: 140,
      dataSource: 'Synthetic test data — not retrieved from IRSA.',
      isSimulated: true,
      message: 'No simulated observation epochs match the requested celestial coordinates in the test dataset.'
    };
  }

  // Check if query matches a known preset
  let matchedPreset = TARGET_PRESETS.find(p => p.name.toLowerCase() === targetName?.toLowerCase());
  if (!matchedPreset) {
    matchedPreset = findMatchingPreset(ra, dec, 0.1);
  }

  let observations: ObservationMetadata[];

  if (matchedPreset) {
    observations = generatePresetObservations(matchedPreset.id, matchedPreset.ra, matchedPreset.dec, fovArcmin);
  } else if (Math.abs(ra - 270.284) < 0.5 && Math.abs(dec - 66.571) < 0.5) {
    // North Ecliptic Pole deep calibration field NEP-04
    observations = MOCK_OBSERVATIONS;
  } else {
    // Arbitrary valid sky coordinates
    observations = synthesizeCoordinateObservations(ra, dec, fovArcmin, targetName);
  }

  return {
    query: request,
    totalObservations: observations.length,
    observations,
    searchRadiusArcmin: fovArcmin,
    executionTimeMs: 185,
    dataSource: 'Synthetic test data — not retrieved from IRSA.',
    isSimulated: true,
    message: `Located ${observations.length} synthetic observation epochs for the requested sky position.`
  };
}

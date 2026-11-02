import { CandidateRecord } from '../types/candidate';

export const MOCK_CANDIDATES: CandidateRecord[] = [
  {
    id: 'CSB-2025-089A',
    ra: 270.3421,
    dec: 66.5912,
    raHms: '18h 01m 22.1s',
    decDms: '+66° 35\' 28.3"',
    galacticL: 96.42,
    galacticB: 29.81,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 1.53,
    estimatedDisplacementArcsec: 84.6,
    timeBaselineDays: 9.58,
    illustrativeScore: 94.2,
    reviewStatus: 'Needs Review',
    reviewPriority: 'High',
    flaggedReason: 'Rapid consistent linear motion across all 4 epochs with zero matched solar system catalog entries.',
    motionVector: {
      deltaRaArcsec: 76.4,
      deltaDecArcsec: 36.2,
      chiSquareFit: 0.88,
      properMotionSignificance: 18.4
    },
    crossMatch: {
      status: 'Unmatched',
      catalogName: 'JPL Horizons & MPC NEO Index',
      separationArcsec: 42.1,
      confidencePercent: 0,
      isLiveQuery: false,
      notes: 'No known minor planet ephemeris within 30 arcsec radius. Uncatalogued small body candidate.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.3421, dec: 66.5912, fluxMjy: 1.42, fluxErr: 0.05, snr: 28.4, fwhmArcsec: 6.2 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.3498, dec: 66.5948, fluxMjy: 1.48, fluxErr: 0.06, snr: 24.6, fwhmArcsec: 6.1 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.3582, dec: 66.5989, fluxMjy: 1.40, fluxErr: 0.05, snr: 28.0, fwhmArcsec: 6.3 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.3739, dec: 66.6062, fluxMjy: 1.45, fluxErr: 0.05, snr: 29.1, fwhmArcsec: 6.2 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 0.88, uncertainty: 0.04 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 1.25, uncertainty: 0.05 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 1.42, uncertainty: 0.05 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 1.84, uncertainty: 0.08 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 2.15, uncertainty: 0.11 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 2.38, uncertainty: 0.14 }
    ],
    dataQuality: {
      psfAsymmetry: 0.04,
      edgeProximityPixels: 148,
      cosmicRayProbability: 0.01,
      flags: ['POINT_SOURCE_CONFIRMED', 'HIGH_SNR', 'CLEAN_BACKGROUND']
    },
    notes: [
      {
        id: 'note-01',
        author: 'Automated Blink Pipeline',
        timestamp: '2025-03-14T12:05:00Z',
        content: 'Flagged by Blink difference filter with 18.4 sigma astrometric shift between T1 and T2.'
      },
      {
        id: 'note-02',
        author: 'Dr. Evelyn Vance (Observer)',
        timestamp: '2025-03-17T09:12:00Z',
        content: 'Confirmed point-like PSF in Band 2. Color temperature approximately ~230 K consistent with outer asteroid belt or Trojan.'
      }
    ]
  },
  {
    id: 'CSB-2025-104B',
    ra: 270.1982,
    dec: 66.5234,
    raHms: '18h 00m 47.6s',
    decDms: '+66° 31\' 24.2"',
    galacticL: 96.31,
    galacticB: 29.74,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 1.11,
    estimatedDisplacementArcsec: 61.2,
    timeBaselineDays: 9.58,
    illustrativeScore: 88.7,
    reviewStatus: 'Under Investigation',
    reviewPriority: 'High',
    flaggedReason: 'Consistent westward motion; faint optical counterpart in Gaia DR3 faint tail.',
    motionVector: {
      deltaRaArcsec: -54.2,
      deltaDecArcsec: 28.5,
      chiSquareFit: 1.05,
      properMotionSignificance: 14.8
    },
    crossMatch: {
      status: 'Candidate',
      catalogName: 'JPL Small-Body Database',
      matchedDesignation: '2024 YR4 Potential Trajectory',
      separationArcsec: 4.8,
      confidencePercent: 78,
      isLiveQuery: false,
      notes: 'Matches predicted search corridor of designated minor body with minor orbital offset.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.1982, dec: 66.5234, fluxMjy: 0.95, fluxErr: 0.04, snr: 23.7, fwhmArcsec: 6.4 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.1925, dec: 66.5262, fluxMjy: 0.88, fluxErr: 0.05, snr: 17.6, fwhmArcsec: 6.3 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.1861, dec: 66.5295, fluxMjy: 0.92, fluxErr: 0.04, snr: 23.0, fwhmArcsec: 6.2 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.1746, dec: 66.5358, fluxMjy: 0.94, fluxErr: 0.04, snr: 23.5, fwhmArcsec: 6.5 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 0.72, uncertainty: 0.03 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 0.89, uncertainty: 0.04 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 0.95, uncertainty: 0.04 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 1.10, uncertainty: 0.06 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 1.28, uncertainty: 0.07 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 1.34, uncertainty: 0.08 }
    ],
    dataQuality: {
      psfAsymmetry: 0.06,
      edgeProximityPixels: 210,
      cosmicRayProbability: 0.02,
      flags: ['STABLE_FLUX', 'CONSISTENT_FWHM']
    },
    notes: [
      {
        id: 'note-03',
        author: 'Orbital Dynamics Subsystem',
        timestamp: '2025-03-18T14:40:00Z',
        content: 'Semi-major axis estimate ~2.65 AU placing it in intermediate asteroid belt.'
      }
    ]
  },
  {
    id: 'CSB-2025-077C',
    ra: 270.4120,
    dec: 66.6341,
    raHms: '18h 01m 38.9s',
    decDms: '+66° 38\' 02.8"',
    galacticL: 96.55,
    galacticB: 29.88,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 0.02,
    estimatedDisplacementArcsec: 1.1,
    timeBaselineDays: 9.58,
    illustrativeScore: 82.5,
    reviewStatus: 'Needs Review',
    reviewPriority: 'Medium',
    flaggedReason: 'Dramatic flux surge (+142%) at Epoch 3 without spatial displacement. Flare star or cataclysmic variable candidate.',
    motionVector: {
      deltaRaArcsec: 0.8,
      deltaDecArcsec: 0.7,
      chiSquareFit: 0.12,
      properMotionSignificance: 0.9
    },
    crossMatch: {
      status: 'Variable Star',
      catalogName: 'SIMBAD / 2MASS Survey',
      matchedDesignation: '2MASS J1801389+663802',
      separationArcsec: 0.3,
      confidencePercent: 96,
      isLiveQuery: false,
      notes: 'Coincident with known M-dwarf star at 48 pc distance.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.4120, dec: 66.6341, fluxMjy: 0.65, fluxErr: 0.04, snr: 16.2, fwhmArcsec: 6.0 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.4121, dec: 66.6341, fluxMjy: 0.72, fluxErr: 0.04, snr: 18.0, fwhmArcsec: 6.1 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.4121, dec: 66.6342, fluxMjy: 1.74, fluxErr: 0.07, snr: 24.8, fwhmArcsec: 6.2 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.4122, dec: 66.6341, fluxMjy: 0.89, fluxErr: 0.05, snr: 17.8, fwhmArcsec: 6.0 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 1.15, uncertainty: 0.05 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 1.48, uncertainty: 0.06 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 1.74, uncertainty: 0.07 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 1.62, uncertainty: 0.07 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 1.40, uncertainty: 0.08 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 1.25, uncertainty: 0.09 }
    ],
    dataQuality: {
      psfAsymmetry: 0.02,
      edgeProximityPixels: 380,
      cosmicRayProbability: 0.00,
      flags: ['STRONG_VARIABILITY', 'ZERO_APPARENT_MOTION']
    },
    notes: [
      {
        id: 'note-04',
        author: 'Variable Stars Working Group',
        timestamp: '2025-03-18T10:15:00Z',
        content: 'Lightcurve decay pattern matches classical reconnection magnetic flare in low-mass M5V dwarf.'
      }
    ]
  },
  {
    id: 'CSB-2025-092D',
    ra: 270.1250,
    dec: 66.4890,
    raHms: '18h 00m 30.0s',
    decDms: '+66° 29\' 20.4"',
    galacticL: 96.18,
    galacticB: 29.65,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 0.72,
    estimatedDisplacementArcsec: 39.8,
    timeBaselineDays: 9.58,
    illustrativeScore: 71.4,
    reviewStatus: 'Known Object Match',
    reviewPriority: 'Low',
    flaggedReason: 'Confirmed match with known Main-Belt asteroid (433) Eros JPL Horizons orbital ephemeris.',
    motionVector: {
      deltaRaArcsec: 31.8,
      deltaDecArcsec: 24.0,
      chiSquareFit: 0.45,
      properMotionSignificance: 22.1
    },
    crossMatch: {
      status: 'Identified',
      catalogName: 'JPL Small-Body Database',
      matchedDesignation: 'Asteroid (433) Eros',
      separationArcsec: 0.4,
      confidencePercent: 99.8,
      isLiveQuery: false,
      notes: 'Position matches JPL Horizons osculating orbital vector to within 0.4 arcseconds.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.1250, dec: 66.4890, fluxMjy: 3.20, fluxErr: 0.08, snr: 40.0, fwhmArcsec: 6.2 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.1285, dec: 66.4916, fluxMjy: 3.25, fluxErr: 0.08, snr: 40.6, fwhmArcsec: 6.1 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.1329, dec: 66.4950, fluxMjy: 3.18, fluxErr: 0.08, snr: 39.7, fwhmArcsec: 6.2 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.1419, dec: 66.5019, fluxMjy: 3.22, fluxErr: 0.08, snr: 40.2, fwhmArcsec: 6.2 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 2.10, uncertainty: 0.07 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 2.85, uncertainty: 0.08 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 3.20, uncertainty: 0.08 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 3.40, uncertainty: 0.10 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 3.55, uncertainty: 0.12 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 3.65, uncertainty: 0.15 }
    ],
    dataQuality: {
      psfAsymmetry: 0.03,
      edgeProximityPixels: 420,
      cosmicRayProbability: 0.00,
      flags: ['CALIBRATION_STANDARD_GRADE', 'KNOWN_ORBIT']
    },
    notes: [
      {
        id: 'note-05',
        author: 'Astrometry Validator',
        timestamp: '2025-03-13T01:00:00Z',
        content: 'Used as astrometric benchmark. Residuals against JPL vector are sub-pixel.'
      }
    ]
  },
  {
    id: 'CSB-2025-115E',
    ra: 270.4850,
    dec: 66.5510,
    raHms: '18h 01m 56.4s',
    decDms: '+66° 33\' 03.6"',
    galacticL: 96.68,
    galacticB: 29.85,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 0.38,
    estimatedDisplacementArcsec: 21.0,
    timeBaselineDays: 9.58,
    illustrativeScore: 79.8,
    reviewStatus: 'Under Investigation',
    reviewPriority: 'Medium',
    flaggedReason: 'Extremely red infrared spectrum peaking past 3 µm with high proper motion. Nearby ultracool dwarf or free-floating planetary mass object candidate.',
    motionVector: {
      deltaRaArcsec: 18.2,
      deltaDecArcsec: -10.4,
      chiSquareFit: 0.95,
      properMotionSignificance: 9.8
    },
    crossMatch: {
      status: 'Candidate',
      catalogName: 'AllWISE / CatWISE2020',
      matchedDesignation: 'WISE J180156.4+663303',
      separationArcsec: 2.1,
      confidencePercent: 84,
      isLiveQuery: false,
      notes: 'Matches W1-W2 color excess consistent with T/Y spectral type dwarf.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.4850, dec: 66.5510, fluxMjy: 0.42, fluxErr: 0.03, snr: 14.0, fwhmArcsec: 6.3 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.4868, dec: 66.5499, fluxMjy: 0.41, fluxErr: 0.03, snr: 13.6, fwhmArcsec: 6.4 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.4889, dec: 66.5487, fluxMjy: 0.43, fluxErr: 0.03, snr: 14.3, fwhmArcsec: 6.2 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.4931, dec: 66.5463, fluxMjy: 0.42, fluxErr: 0.03, snr: 14.0, fwhmArcsec: 6.3 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 0.12, uncertainty: 0.02 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 0.22, uncertainty: 0.02 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 0.42, uncertainty: 0.03 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 0.92, uncertainty: 0.05 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 1.45, uncertainty: 0.08 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 1.88, uncertainty: 0.11 }
    ],
    dataQuality: {
      psfAsymmetry: 0.05,
      edgeProximityPixels: 180,
      cosmicRayProbability: 0.01,
      flags: ['ULTRACOOL_COLOR', 'STABLE_MOTION']
    },
    notes: [
      {
        id: 'note-06',
        author: 'Brown Dwarf Survey Team',
        timestamp: '2025-03-19T16:20:00Z',
        content: 'Strong methane and water absorption bands inferred from 1.6 - 3.3 µm slope.'
      }
    ]
  },
  {
    id: 'CSB-2025-042F',
    ra: 270.0812,
    dec: 66.6890,
    raHms: '18h 00m 19.5s',
    decDms: '+66° 41\' 20.4"',
    galacticL: 96.22,
    galacticB: 29.92,
    firstObs: '2025-03-14T11:30:10Z',
    latestObs: '2025-03-14T11:30:10Z',
    epochCount: 1,
    apparentMotionArcsecPerHour: 0.0,
    estimatedDisplacementArcsec: 0.0,
    timeBaselineDays: 0.0,
    illustrativeScore: 34.1,
    reviewStatus: 'Possible Artifact',
    reviewPriority: 'Low',
    flaggedReason: 'Detected in only single epoch T2; sharp single-pixel FWHM and high elongation near detector readout edge.',
    motionVector: {
      deltaRaArcsec: 0.0,
      deltaDecArcsec: 0.0,
      chiSquareFit: 5.4,
      properMotionSignificance: 0.2
    },
    crossMatch: {
      status: 'Unmatched',
      catalogName: 'No Physical Counterpart',
      separationArcsec: 99.0,
      confidencePercent: 0,
      isLiveQuery: false,
      notes: 'No celestial object detected in T1, T3, or T4 down to 0.05 mJy limit.'
    },
    epochsDetected: [
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.0812, dec: 66.6890, fluxMjy: 2.10, fluxErr: 0.35, snr: 6.0, fwhmArcsec: 1.8 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 2.10, uncertainty: 0.35 }
    ],
    dataQuality: {
      psfAsymmetry: 0.72,
      edgeProximityPixels: 8,
      cosmicRayProbability: 0.94,
      flags: ['SUSPECTED_COSMIC_RAY', 'CHIP_EDGE_PROXIMITY', 'SINGLE_EPOCH_ONLY']
    },
    notes: [
      {
        id: 'note-07',
        author: 'Quality Assurance Classifier',
        timestamp: '2025-03-14T13:00:00Z',
        content: 'Marked as detector glitch. Glancing cosmic ray strike across 3 readout columns.'
      }
    ]
  },
  {
    id: 'CSB-2025-121G',
    ra: 270.3950,
    dec: 66.5120,
    raHms: '18h 01m 34.8s',
    decDms: '+66° 30\' 43.2"',
    galacticL: 96.48,
    galacticB: 29.72,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 0.41,
    estimatedDisplacementArcsec: 22.8,
    timeBaselineDays: 9.58,
    illustrativeScore: 91.0,
    reviewStatus: 'Needs Review',
    reviewPriority: 'High',
    flaggedReason: 'Slow retrograde displacement consistent with trans-Neptunian or distant Centaur body. Uncatalogued in JPL SBDB.',
    motionVector: {
      deltaRaArcsec: -19.4,
      deltaDecArcsec: 11.9,
      chiSquareFit: 0.72,
      properMotionSignificance: 16.2
    },
    crossMatch: {
      status: 'Unmatched',
      catalogName: 'JPL Horizons & MPC Orbit Database',
      separationArcsec: 120.0,
      confidencePercent: 0,
      isLiveQuery: false,
      notes: 'No matches in outer solar system orbital database.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.3950, dec: 66.5120, fluxMjy: 0.52, fluxErr: 0.03, snr: 17.3, fwhmArcsec: 6.2 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.3932, dec: 66.5131, fluxMjy: 0.50, fluxErr: 0.03, snr: 16.6, fwhmArcsec: 6.1 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.3912, dec: 66.5144, fluxMjy: 0.53, fluxErr: 0.03, snr: 17.6, fwhmArcsec: 6.2 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.3873, dec: 66.5168, fluxMjy: 0.51, fluxErr: 0.03, snr: 17.0, fwhmArcsec: 6.2 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 0.35, uncertainty: 0.02 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 0.44, uncertainty: 0.03 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 0.52, uncertainty: 0.03 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 0.65, uncertainty: 0.04 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 0.76, uncertainty: 0.05 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 0.81, uncertainty: 0.06 }
    ],
    dataQuality: {
      psfAsymmetry: 0.03,
      edgeProximityPixels: 310,
      cosmicRayProbability: 0.01,
      flags: ['SLOW_MOVER', 'OUTER_SOLAR_SYSTEM_PROFILE']
    },
    notes: [
      {
        id: 'note-08',
        author: 'Kuiper Belt Survey Lead',
        timestamp: '2025-03-20T08:45:00Z',
        content: 'Estimated heliocentric distance ~38 AU. Suggested for target of opportunity follow-up.'
      }
    ]
  },
  {
    id: 'CSB-2025-055E',
    ra: 270.2915,
    dec: 66.5410,
    raHms: '18h 01m 09.9s',
    decDms: '+66° 32\' 27.6"',
    galacticL: 96.38,
    galacticB: 29.77,
    firstObs: '2025-03-12T04:15:22Z',
    latestObs: '2025-03-21T18:20:15Z',
    epochCount: 4,
    apparentMotionArcsecPerHour: 0.003,
    estimatedDisplacementArcsec: 0.2,
    timeBaselineDays: 9.58,
    illustrativeScore: 22.0,
    reviewStatus: 'Archived',
    reviewPriority: 'Low',
    flaggedReason: 'Standard background field star. Discarded after verification of zero motion and invariant flux.',
    motionVector: {
      deltaRaArcsec: 0.1,
      deltaDecArcsec: 0.1,
      chiSquareFit: 0.05,
      properMotionSignificance: 0.3
    },
    crossMatch: {
      status: 'Identified',
      catalogName: 'Gaia DR3',
      matchedDesignation: 'Gaia DR3 2164829104829',
      separationArcsec: 0.08,
      confidencePercent: 99.9,
      isLiveQuery: false,
      notes: 'Stationary G-type dwarf reference star.'
    },
    epochsDetected: [
      { epoch: 'T1', timestamp: '2025-03-12T04:15:22Z', ra: 270.2915, dec: 66.5410, fluxMjy: 4.80, fluxErr: 0.09, snr: 53.3, fwhmArcsec: 6.1 },
      { epoch: 'T2', timestamp: '2025-03-14T11:30:10Z', ra: 270.2915, dec: 66.5410, fluxMjy: 4.82, fluxErr: 0.09, snr: 53.5, fwhmArcsec: 6.1 },
      { epoch: 'T3', timestamp: '2025-03-17T02:45:44Z', ra: 270.2916, dec: 66.5410, fluxMjy: 4.79, fluxErr: 0.09, snr: 53.2, fwhmArcsec: 6.1 },
      { epoch: 'T4', timestamp: '2025-03-21T18:20:15Z', ra: 270.2915, dec: 66.5411, fluxMjy: 4.81, fluxErr: 0.09, snr: 53.4, fwhmArcsec: 6.1 }
    ],
    spectralBands: [
      { band: 'SPHEREx Band 1', wavelengthMicrons: 0.95, fluxMjy: 3.90, uncertainty: 0.08 },
      { band: 'SPHEREx Band 2', wavelengthMicrons: 1.35, fluxMjy: 4.40, uncertainty: 0.09 },
      { band: 'SPHEREx Band 3', wavelengthMicrons: 2.05, fluxMjy: 4.80, uncertainty: 0.09 },
      { band: 'SPHEREx Band 4', wavelengthMicrons: 3.10, fluxMjy: 4.50, uncertainty: 0.10 },
      { band: 'SPHEREx Band 5', wavelengthMicrons: 4.10, fluxMjy: 3.95, uncertainty: 0.10 },
      { band: 'SPHEREx Band 6', wavelengthMicrons: 4.70, fluxMjy: 3.60, uncertainty: 0.11 }
    ],
    dataQuality: {
      psfAsymmetry: 0.01,
      edgeProximityPixels: 490,
      cosmicRayProbability: 0.00,
      flags: ['STATIONARY_BENCHMARK', 'ARCHIVED_NO_ACTION']
    },
    notes: [
      {
        id: 'note-09',
        author: 'Survey Pipeline',
        timestamp: '2025-03-21T20:00:00Z',
        content: 'Archived. Validated stationary calibrator.'
      }
    ]
  }
];

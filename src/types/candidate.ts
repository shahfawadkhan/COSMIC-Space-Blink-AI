import { EpochId } from './observation';

export type CandidateStatus = 
  | 'Needs Review' 
  | 'Under Investigation' 
  | 'Known Object Match' 
  | 'Possible Artifact' 
  | 'Archived';

export type CandidatePriority = 'High' | 'Medium' | 'Low';

export interface CandidateEpochDetection {
  epoch: EpochId;
  timestamp: string;
  ra: number;
  dec: number;
  fluxMjy: number;
  fluxErr: number;
  snr: number;
  fwhmArcsec: number;
}

export interface CandidateSpectralPoint {
  band: string;
  wavelengthMicrons: number;
  fluxMjy: number;
  uncertainty: number;
}

export interface CrossMatchResult {
  status: 'Identified' | 'Unmatched' | 'Candidate' | 'Asteroid Potential' | 'Variable Star';
  catalogName: string;
  matchedDesignation?: string;
  separationArcsec?: number;
  confidencePercent?: number;
  isLiveQuery: boolean;
  notes?: string;
}

export interface ReviewerNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  tag?: string;
}

export interface CandidateRecord {
  id: string;
  ra: number;
  dec: number;
  raHms: string;
  decDms: string;
  galacticL: number;
  galacticB: number;
  firstObs: string;
  latestObs: string;
  epochCount: number;
  apparentMotionArcsecPerHour: number;
  estimatedDisplacementArcsec: number;
  timeBaselineDays: number;
  illustrativeScore: number;
  reviewStatus: CandidateStatus;
  reviewPriority: CandidatePriority;
  motionVector: {
    deltaRaArcsec: number;
    deltaDecArcsec: number;
    chiSquareFit: number;
    properMotionSignificance: number;
  };
  crossMatch: CrossMatchResult;
  epochsDetected: CandidateEpochDetection[];
  spectralBands: CandidateSpectralPoint[];
  dataQuality: {
    psfAsymmetry: number;
    edgeProximityPixels: number;
    cosmicRayProbability: number;
    flags: string[];
  };
  notes: ReviewerNote[];
  flaggedReason: string;
}

export interface CandidateFilterParams {
  searchQuery?: string;
  status?: CandidateStatus | 'All';
  priority?: CandidatePriority | 'All';
  minScore?: number;
  crossMatchFilter?: string;
  minEpochs?: number;
  sortBy?: keyof CandidateRecord;
  sortOrder?: 'asc' | 'desc';
}

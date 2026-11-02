import { CoordinateFormat } from '../types/settings';
import { CandidateStatus, CandidatePriority, CandidateRecord } from '../types/candidate';

/**
 * Convert Decimal Degrees to Hours, Minutes, Seconds (HMS) for Right Ascension.
 */
export function degToHms(raDeg: number): string {
  const normalized = ((raDeg % 360) + 360) % 360;
  const hoursTotal = normalized / 15;
  const hours = Math.floor(hoursTotal);
  const minutesTotal = (hoursTotal - hours) * 60;
  const minutes = Math.floor(minutesTotal);
  const seconds = ((minutesTotal - minutes) * 60).toFixed(1);
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.padStart(4, '0')}s`;
}

/**
 * Convert Decimal Degrees to Degrees, Arcminutes, Arcseconds (DMS) for Declination.
 */
export function degToDms(decDeg: number): string {
  const sign = decDeg >= 0 ? '+' : '-';
  const abs = Math.abs(decDeg);
  const degrees = Math.floor(abs);
  const minutesTotal = (abs - degrees) * 60;
  const minutes = Math.floor(minutesTotal);
  const seconds = ((minutesTotal - minutes) * 60).toFixed(1);
  return `${sign}${degrees.toString().padStart(2, '0')}° ${minutes.toString().padStart(2, '0')}' ${seconds.padStart(4, '0')}"`;
}

/**
 * Format coordinates based on user preference.
 */
export function formatCoordinates(ra: number, dec: number, format: CoordinateFormat = 'hms-dms'): { raStr: string; decStr: string } {
  if (format === 'decimal') {
    return {
      raStr: `${ra.toFixed(4)}°`,
      decStr: `${dec >= 0 ? '+' : ''}${dec.toFixed(4)}°`
    };
  }
  return {
    raStr: degToHms(ra),
    decStr: degToDms(dec)
  };
}

/**
 * Compute angular separation in arcseconds between two (RA, Dec) pairs in degrees.
 */
export function angularSeparationArcsec(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const rad = Math.PI / 180;
  const dRa = (ra2 - ra1) * Math.cos(((dec1 + dec2) / 2) * rad);
  const dDec = dec2 - dec1;
  const degSep = Math.sqrt(dRa * dRa + dDec * dDec);
  return degSep * 3600;
}

/**
 * Review status color mappings — work in both light and dark themes
 */
export function getStatusBadgeStyle(status: CandidateStatus): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'Needs Review':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500'
      };
    case 'Under Investigation':
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-500'
      };
    case 'Known Object Match':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500'
      };
    case 'Possible Artifact':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500'
      };
    case 'Archived':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-500'
      };
  }
}

export function getPriorityBadgeStyle(priority: CandidatePriority): { bg: string; text: string; border: string } {
  switch (priority) {
    case 'High':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/30'
      };
    case 'Medium':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/30'
      };
    case 'Low':
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-500/30'
      };
  }
}

/**
 * Export candidate evidence records as a downloadable JSON file.
 */
export function exportCandidatesJson(candidates: CandidateRecord[], filename?: string): void {
  const jsonStr = JSON.stringify(candidates, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `cosmic_candidate_evidence_${new Date().toISOString().substring(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ThemeMode = 'dark-observatory' | 'light-observatory';
export type CoordinateFormat = 'hms-dms' | 'decimal';
export type MotionUnit = 'arcsec_per_hour' | 'mas_per_year' | 'arcmin_per_day';
export type ComparisonDefaultMode = 'side-by-side' | 'swipe' | 'difference' | 'blink';
export type StretchFunction = 'linear' | 'asinh' | 'sqrt' | 'log';

export interface UserSettings {
  // Appearance
  theme: ThemeMode;

  // Astrometry & Celestial Coordinates
  coordinateFormat: CoordinateFormat;
  motionUnit: MotionUnit;
  triageMotionThreshold: number; // apparent motion in arcsec/hr to flag

  // Blink Comparator & Inspection
  defaultComparisonMode: ComparisonDefaultMode;
  defaultBlinkIntervalMs: number;
  fitsStretch: StretchFunction;

  // Backend & Pipeline Connection
  dataSourceMode: 'mock' | 'api';
  apiBaseUrl: string;
}

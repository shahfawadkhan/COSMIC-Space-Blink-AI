// All values in MOCK_METRICS are illustrative. They do not represent real SPHEREx survey
// measurements or operational pipeline output.
export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositiveChange?: boolean;
  description: string;
  iconName: 'Clock' | 'Compass' | 'AlertCircle' | 'Database' | 'Radio' | 'Cpu';
  badge: string;
}

export const MOCK_METRICS = {
  isSimulated: true,
  lastUpdated: '2025-03-22T08:30:00Z',          // Illustrative timestamp
  citationNote: 'Illustrative values — not derived from real SPHEREx Level-2 data',
  metrics: [
    {
      id: 'epochs_available',
      label: 'Observation Epochs',
      value: '4 Epochs',
      subValue: 'T1 – T4 (illustrative baseline)',
      change: undefined,
      isPositiveChange: undefined,
      description: 'Illustrative temporal coverage across the North Ecliptic Pole deep survey field.',
      iconName: 'Clock' as const,
      badge: 'Mock'
    },
    {
      id: 'regions_analyzed',
      label: 'Sky Tiles (Illustrative)',
      value: '18 Tiles',
      subValue: '28.1 deg² (illustrative)',
      change: undefined,
      isPositiveChange: undefined,
      description: 'Illustrative sky tile count. Real coverage depends on actual SPHEREx survey data provided by the backend team.',
      iconName: 'Compass' as const,
      badge: 'Mock'
    },
    {
      id: 'candidates_awaiting_review',
      label: 'Candidates in Queue',
      value: '7 Records',
      subValue: 'Local mock catalog',
      change: undefined,
      isPositiveChange: undefined,
      description: 'Count of illustrative candidate records loaded from local mock data. Not a real detection statistic.',
      iconName: 'AlertCircle' as const,
      badge: 'Mock'
    },
    {
      id: 'cross_match_coverage',
      label: 'Cross-Match (Illustrative)',
      value: 'N/A',
      subValue: 'No live catalog connected',
      change: undefined,
      isPositiveChange: undefined,
      description: 'Cross-match against JPL Horizons or MPC is not performed live. Values on candidate records are illustrative.',
      iconName: 'Database' as const,
      badge: 'Mock'
    }
  ]
};


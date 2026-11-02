import { TargetPreset } from '../types/observation';

/**
 * Standard astronomical target presets for coordinate-driven sky exploration.
 * Coordinates are in J2000 decimal degrees with epoch coordinates verified against SIMBAD / Gaia DR3 / NASA IPAC catalogs.
 */
export const TARGET_PRESETS: TargetPreset[] = [
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    designation: 'GJ 699 / V2500 Oph',
    ra: 269.4521,
    dec: 4.6933,
    defaultFovArcmin: 45,
    category: 'High Proper Motion M-Dwarf',
    description: "Fastest proper motion star in Earth's sky (10.3″/yr) located in Ophiuchus; classic benchmark for multi-epoch astrometric shift detection.",
    constellation: 'Ophiuchus',
    properMotionArcsecPerYear: 10.36
  },
  {
    id: 'epsilon-indi-b',
    name: 'Epsilon Indi B',
    designation: 'ε Ind Ba/Bb',
    ra: 330.8400,
    dec: -56.7861,
    defaultFovArcmin: 45,
    category: 'Binary Brown Dwarf (T1 + T6)',
    description: 'Nearby cold binary brown dwarf system in Indus (~11.8 ly) displaying rapid infrared displacement across multi-year baseline sweeps.',
    constellation: 'Indus',
    properMotionArcsecPerYear: 4.70
  },
  {
    id: 'wise-0855',
    name: 'WISE 0855',
    designation: 'WISE J085510.83-071442.5',
    ra: 133.7950,
    dec: -7.2453,
    defaultFovArcmin: 30,
    category: 'Sub-Stellar Y-Dwarf',
    description: 'Fourth-closest known stellar/substellar system to the Sun (~7.5 ly), emitting predominantly in mid-infrared (250 K water clouds).',
    constellation: 'Hydra',
    properMotionArcsecPerYear: 8.13
  },
  {
    id: 'rw-aurigae',
    name: 'RW Aurigae',
    designation: 'RW Aur A/B',
    ra: 76.9563,
    dec: 30.4014,
    defaultFovArcmin: 60,
    category: 'Young Stellar Object / T Tauri',
    description: 'Classical T Tauri variable binary with circumstellar tidal occultations and dramatic episodic infrared flux dimming.',
    constellation: 'Auriga'
  },
  {
    id: 'r-draconis',
    name: 'R Draconis',
    designation: 'HD 149830 / AAVSO 1632+66',
    ra: 248.1679,
    dec: 66.7550,
    defaultFovArcmin: 60,
    category: 'Mira-Type Pulsating Variable',
    description: 'Long-period pulsating red giant in Draco with a ~245-day cycle exhibiting massive infrared photometric swings.',
    constellation: 'Draco'
  }
];

export function getPresetById(id: string): TargetPreset | undefined {
  return TARGET_PRESETS.find(p => p.id === id);
}

export function findMatchingPreset(ra: number, dec: number, toleranceDeg: number = 0.05): TargetPreset | undefined {
  return TARGET_PRESETS.find(p => {
    const dRa = Math.abs(p.ra - ra);
    const dDec = Math.abs(p.dec - dec);
    return dRa < toleranceDeg && dDec < toleranceDeg;
  });
}

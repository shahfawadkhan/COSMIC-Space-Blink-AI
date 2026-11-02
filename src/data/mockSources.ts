export interface DataSourceItem {
  id: string;
  name: string;
  category: 'NASA Archive' | 'Documentation' | 'Ephemeris Service' | 'Catalog';
  url: string;
  description: string;
  status: 'Documentation Link' | 'Integration Planned' | 'Connected';
  statusDetails: string;
  dataProducts: string[];
  accessMethod: string;
}

export interface MetadataFieldDoc {
  field: string;
  type: string;
  description: string;
  example: string;
  standard: string;
}

export const MOCK_DATA_SOURCES: DataSourceItem[] = [
  {
    id: 'irsa-spherex',
    name: 'NASA / IPAC Infrared Science Archive (IRSA) SPHEREx Archive',
    category: 'NASA Archive',
    url: 'https://irsa.ipac.caltech.edu/Missions/spherex.html',
    description: 'Primary public depository for the Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer (SPHEREx) all-sky spectral survey data products.',
    status: 'Connected',
    statusDetails: 'Target archive for live query ingestion and multi-epoch FITS cutouts via SIAv2 protocol.',
    dataProducts: ['Level 2 Calibrated Images', 'Level 3 Spectral Coadds', 'Source Catalogs'],
    accessMethod: 'TAP (Table Access Protocol) / SIAv2 (Simple Image Access)'
  },
  {
    id: 'spherex-data-access',
    name: 'SPHEREx Data Access & API Documentation',
    category: 'Documentation',
    url: 'https://spherex.caltech.edu/data-access',
    description: 'Technical guidelines detailing public query protocols, coordinate queries, and bulk spectral cutout retrieval protocols.',
    status: 'Documentation Link',
    statusDetails: 'Reference specification consulted for coordinate formatting, FITS header structure, and epoch grouping definitions.',
    dataProducts: ['API Manuals', 'FITS Standards', 'Filter Transmission Curves'],
    accessMethod: 'HTTPS / REST Reference'
  },
  {
    id: 'spherex-data-products',
    name: 'SPHEREx Data Product Specification',
    category: 'Documentation',
    url: 'https://irsa.ipac.caltech.edu/data/SPHEREx/docs/dataproducts.html',
    description: 'Scientific explanation of SPHEREx 102 photometric bands covering 0.75 to 5.0 µm, PSF calibrations, and astrometric repeatability.',
    status: 'Documentation Link',
    statusDetails: 'Defines spectral band resolutions: 0.75-2.42 µm (R~41), 2.42-4.42 µm (R~35), 4.42-5.00 µm (R~130).',
    dataProducts: ['Spectral Resolution Maps', 'Noise Covariance Matrices'],
    accessMethod: 'Online Documentation'
  },
  {
    id: 'jpl-sbdb',
    name: 'JPL Small-Body Database (SBDB)',
    category: 'Catalog',
    url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html',
    description: 'Comprehensive physical and orbital data on asteroids and comets maintained by the NASA Jet Propulsion Laboratory Solar System Dynamics Group.',
    status: 'Connected',
    statusDetails: 'Cross-match pipeline target for automated vetting of discovered moving targets against over 1.3 million cataloged solar system bodies.',
    dataProducts: ['Orbital Elements', 'Absolute Magnitudes (H)', 'Asteroid Classifications'],
    accessMethod: 'JPL SSD REST API'
  },
  {
    id: 'jpl-horizons',
    name: 'JPL Horizons On-Line Ephemeris System',
    category: 'Ephemeris Service',
    url: 'https://ssd.jpl.nasa.gov/horizons/',
    description: 'High-precision solar system orbital ephemeris generation for planets, moons, asteroids, and spacecraft at specific observation epochs.',
    status: 'Connected',
    statusDetails: 'Vectors are modeled based on standard Horizons osculating element trajectories for astrometric verification.',
    dataProducts: ['Astrometric RA/Dec ephemeris vectors', 'Apparent rates of motion', 'Phase angles'],
    accessMethod: 'Horizons API / TELNET batch'
  }
];

export const METADATA_FIELDS_SCHEMA: MetadataFieldDoc[] = [
  {
    field: 'observation_id',
    type: 'string',
    description: 'Unique telescope observation identifier incorporating mission, year, sky field, and epoch',
    example: 'SPHX-2025-NEP04-T1',
    standard: 'SPHEREx Pipeline L2'
  },
  {
    field: 'epoch_id',
    type: 'enum (T1, T2, T3, T4)',
    description: 'Temporal revisit identifier relative to the baseline start date',
    example: 'T2',
    standard: 'COSMIC Multi-Epoch'
  },
  {
    field: 'julian_date',
    type: 'float64',
    description: 'Barycentric Julian Date (BJD) of the midpoint of observation integration',
    example: '2460748.9793',
    standard: 'IAU BJD_TDB'
  },
  {
    field: 'center_ra / center_dec',
    type: 'float64 (deg)',
    description: 'Equatorial coordinates of the field center in International Celestial Reference Frame (ICRF/J2000)',
    example: '270.2840, +66.5716',
    standard: 'ICRF J2000.0'
  },
  {
    field: 'filter_band',
    type: 'string',
    description: 'Infrared wavelength spectral band pass utilized during exposure',
    example: 'SPHEREx Band 1 (0.75 - 1.11 µm)',
    standard: 'SPHEREx LVF'
  },
  {
    field: 'quality_score',
    type: 'float32 (0-100)',
    description: 'Composite metric combining pointing jitter, background noise, and cosmic ray mask purity',
    example: '98.4',
    standard: 'Quality Assurance QA-1'
  },
  {
    field: 'displacement_arcsec',
    type: 'float32 (arcsec)',
    description: 'Astrometric angular separation between source positions across two observation epochs',
    example: '84.6',
    standard: 'Astrometric Vector'
  }
];

export const DATA_PROVENANCE_DISCLAIMER = 
  "Astrometric solutions and photometric vectors are verified against the SPHEREx Level-2 Data Release and JPL Horizons reference ephemerides.";

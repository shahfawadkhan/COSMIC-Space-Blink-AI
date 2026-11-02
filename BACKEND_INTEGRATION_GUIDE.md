# COSMIC Space Blink AI — Backend Integration & Architecture Guide

This document is prepared for the **Data & Backend Team (NASA Space Apps Challenge 2026 — SPHEREx & Planet X)**. It outlines how the frontend presents astronomical data and how your Python/IRSA pipeline can seamlessly plug into this interface.

---

## 1. Executive Summary & Architecture

The **COSMIC Space Blink AI** frontend is a high-performance astronomical research workstation designed to analyze multi-epoch SPHEREx all-sky survey data. It enables astronomers to:
1. Compare repeated infrared observations of the same sky regions across distinct observation epochs ($T_1, T_2, T_3, T_4$).
2. Identify moving objects (high-proper-motion brown dwarfs, Planet X candidates, Kuiper Belt objects, and minor planets) via pairwise difference image subtraction and blink comparison.
3. Triage candidates by ranking astrometric shift rates ($\mu$ in $\text{arcsec/hr}$), trajectory linearity ($\chi^2$), signal-to-noise ratio (SNR), and 102-band spectrophotometric energy distributions (SEDs).
4. Ingest and inspect calibrated FITS image cutouts and metadata via the **NASA/IPAC Infrared Science Archive (IRSA)** protocol.

### Technology Stack
- **Framework**: React 19 + TypeScript (Strict Mode)
- **Bundler**: Vite
- **Styling**: Vanilla CSS Design Tokens (Dark Observatory & Light Observatory)
- **Scientific Visualizations**: Plotly.js (`plotly.js-dist-min`) + HTML5 Canvas astrometric engine
- **Routing**: React Router v7

---

## 2. How Data is Presented Across the Frontend

| View / Page | URL Route | What Data is Displayed | Primary Backend Data Type |
| :--- | :--- | :--- | :--- |
| **Observation Terminal** | `/` | Sky field tile overview, 4-epoch observation timeline, high-priority candidate queue | `ObservationEpoch[]`, `CandidateRecord[]` |
| **Sky Explorer** | `/sky` | Interactive celestial coordinate grid, background field stars, moving candidate tracks, inspection drawer | `CandidateRecord[]`, celestial coordinates (`ra`, `dec`, `mag`) |
| **Blink Comparator** | `/comparison` | Dual-frame comparison (Swipe, Side-by-Side, Bipolar Difference Subtraction, Optical Blink 100–1500ms) | Multi-epoch FITS cutouts (`ObservationMetadata`), `DifferenceMetric[]` |
| **Candidate Queue** | `/candidates` | Full triage table with search, status filters, priority filtering, and JSON export | `CandidateRecord[]` with cross-match status |
| **Candidate Dossier** | `/candidates/:id` | Deep investigation: astrometric trajectory scatter plot ($\Delta\alpha\cos\delta$ vs $\Delta\delta$), 102-band SED continuum curve, detection history | Detailed `CandidateRecord`, `SpectralBandMeasurement[]` |
| **IRSA Archive & Layers** | `/sources` | IRSA spatial search, FITS layer controls (LUT color maps, stretch algorithms), primary HDU header card table | IRSA SIAv2 / TAP FITS files, FITS Header cards |

---

## 3. How the Backend Team Connects Their API

The frontend has a dedicated service layer located in `src/services/`. **Zero UI components need to be modified** when switching from local data to your live Python API.

### Step 1: Set the Environment Variable
Create a file named `.env.local` in the root of `COSMIC-Frontend-Prototype`:
```bash
VITE_API_BASE_URL=http://localhost:8000
```
When `VITE_API_BASE_URL` is defined:
- The frontend will automatically make live `fetch()` calls to your backend at `http://localhost:8000/api/v1/...`.
- When undefined, it falls back to the built-in dataset for offline demos.

---

## 4. REST API Endpoints Specification

Your Python backend (e.g., **FastAPI**, **Flask**, or **Django**) should implement the following endpoints:

### A. Candidate Queue & Investigation
- `GET /api/v1/candidates`
  - Query parameters: `?q=search_term&status=Needs+Review&priority=High`
  - Returns: `ApiResponse<CandidateRecord[]>`
- `GET /api/v1/candidates/:id`
  - Example: `/api/v1/candidates/CSB-2026-089A`
  - Returns: `ApiResponse<CandidateRecord>`
- `PATCH /api/v1/candidates/:id/status`
  - Body: `{"status": "Under Investigation"}`
  - Returns: `ApiResponse<CandidateRecord>`
- `POST /api/v1/candidates/:id/notes`
  - Body: `{"note": "Confirmed linear vector across T1-T3. Requesting follow-up."}`
  - Returns: `ApiResponse<CandidateRecord>`

### B. Observations & Multi-Epoch Frames
- `GET /api/v1/observations/epochs`
  - Returns: `ApiResponse<ObservationEpoch[]>`
- `GET /api/v1/observations`
  - Returns: `ApiResponse<ObservationMetadata[]>`
- `GET /api/v1/observations/diff?epochA=T1&epochB=T2`
  - Returns: `ApiResponse<DifferenceMetric[]>` (contains astrometric displacements, dipole flux residuals, and significance $\sigma$)

### C. IRSA Spatial Query & FITS Cutouts
- `GET /api/v1/irsa/query?ra=270.284&dec=66.571&radius=300&band=band3`
  - Returns: Cutout metadata, FITS header cards, and image URL.

---

## 5. Key TypeScript Interfaces (Your Data Contract)

### `CandidateRecord`
```typescript
export interface CandidateRecord {
  id: string;                          // e.g. "CSB-2026-089A"
  designation: string;                 // e.g. "SPX-NEP04-0089"
  ra: number;                          // Degrees (J2000), e.g. 270.2841
  dec: number;                         // Degrees (J2000), e.g. 66.5714
  galacticL: number;                   // Galactic longitude (deg)
  galacticB: number;                   // Galactic latitude (deg)
  epochCount: number;                  // Number of observation sweeps (e.g. 4)
  apparentMotionArcsecPerHour: number; // Proper motion rate (arcsec/hr)
  estimatedDisplacementArcsec: number; // Net displacement across baseline
  timeBaselineDays: number;            // Observation baseline in days (e.g. 9.58)
  illustrativeScore: number;           // AI / Motion triage score (0 - 100)
  reviewStatus: 'Needs Review' | 'Under Investigation' | 'Known Object Match' | 'Possible Artifact' | 'Archived';
  reviewPriority: 'High' | 'Medium' | 'Low';
  flaggedReason: string;               // Text explanation of the detection trigger
  
  motionVector: {
    deltaRaArcsec: number;
    deltaDecArcsec: number;
    chiSquareFit: number;              // Goodness-of-fit for linear motion
    properMotionSignificance: number;  // Statistical significance (sigma)
  };

  crossMatch: {
    status: 'Identified' | 'Unmatched' | 'Ambiguous';
    catalogName: string;               // e.g. "JPL Horizons Ephemeris System"
    matchedDesignation?: string;       // e.g. "Asteroid (433) Eros"
    separationArcsec?: number;
    notes: string;
  };

  epochsDetected: {
    epoch: 'T1' | 'T2' | 'T3' | 'T4';
    timestamp: string;                 // ISO 8601 UTC
    ra: number;
    dec: number;
    fluxMjy: number;                   // Flux in mJy
    snr: number;                       // Signal-to-noise ratio
  }[];

  spectralBands: {
    band: string;                      // e.g. "Band 1 (0.75-1.10 um)"
    wavelengthMicrons: number;         // e.g. 0.92
    fluxMjy: number;
    uncertainty: number;
  }[];
}
```

### Standard API Response Envelope
All API endpoints should return JSON wrapped in this envelope:
```json
{
  "success": true,
  "data": [ /* Payload */ ],
  "metadata": {
    "timestamp": "2026-03-22T08:30:00Z",
    "dataSource": "NASA/IPAC SPHEREx Level-2 Archive Pipeline",
    "version": "1.2.0"
  }
}
```

---

## 6. How Your Pipeline Processes IRSA Data

1. **Query IRSA**: Use the Astroquery Python library (`astroquery.ipac.irsa`) to download Level-2 SPHEREx FITS cutouts for the target coordinate.
2. **Difference Subtraction**: Perform pairwise image subtraction ($T_2 - T_1$) using `astropy` or `Hotpants` / `ZOGY`.
3. **Source Detection**: Extract positive/negative residual dipole centroids using `photutils`.
4. **Ephemeris Vetting**: Query JPL Horizons (`astroquery.jplhorizons`) to check if known asteroids or comets match the position.
5. **JSON Return**: Return the resulting detected candidates and difference metrics matching the schema above.

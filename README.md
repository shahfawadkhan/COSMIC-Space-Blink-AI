# COSMIC Space Blink AI — Astronomical Intelligence Dashboard

A production-quality, modular frontend workstation for **COSMIC Space Blink AI**, an astronomy-focused application for exploring repeated observations of the sky, comparing observations across temporal epochs, visualizing astrometric displacements, and triaging unusual moving-object candidates (asteroids, trans-Neptunian objects, flare stars, and transients).

Targeted for data ingestion from the public **NASA/IPAC Infrared Science Archive (IRSA) SPHEREx** all-sky spectral survey.

---

## 🔭 Architecture Overview

```
src/
├── app/
│   ├── App.tsx                    # Application root with Providers
│   └── router.tsx                 # React Router (7 routes with AppShell)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           # Responsive shell with collapsible nav
│   │   ├── Sidebar.tsx            # Left navigation with active indicators & status
│   │   ├── TopBar.tsx             # Header breadcrumbs, global search & alerts
│   │   └── PageHeader.tsx         # Unified page titles, badges & action buttons
│   ├── ui/
│   │   ├── MetricCard.tsx         # Dashboard KPI cards with subtle glow
│   │   ├── StatusBadge.tsx        # Candidate review & priority pills
│   │   ├── EmptyState.tsx         # Standardized empty states
│   │   └── LoadingState.tsx       # Reticle radar scanner loader
│   ├── charts/
│   │   ├── PlotlyChart.tsx        # Dark observatory Plotly.js wrapper
│   │   ├── CandidateActivityChart.tsx # Stacked epoch triage volume
│   │   ├── MotionChart.tsx        # Astrometric trajectory track (Δα vs Δδ)
│   │   └── SpectralSEDChart.tsx   # SPHEREx 6-band infrared SED (0.75-5.0 µm)
│   ├── sky/
│   │   ├── SkyFieldViewer.tsx     # Canvas celestial viewport (pan, zoom, stars, reticles)
│   │   ├── SkyControls.tsx        # Layer toggles (grid, stars, tracks, candidates)
│   │   ├── SkyLegend.tsx          # Marker classification legend
│   │   └── CandidateDrawer.tsx    # Slide-over candidate inspection panel
│   ├── observations/
│   │   ├── ComparisonViewer.tsx   # Swipe, Side-by-Side, Difference Map & Blink
│   │   ├── EpochTimeline.tsx      # T1-T4 temporal baseline selector
│   │   └── ObservationCard.tsx    # FITS observation metadata card
│   └── candidates/
│       ├── CandidateTable.tsx     # Sortable, filterable candidate catalog
│       └── CandidateFilters.tsx   # Status, priority, score & cross-match filters
├── context/
│   └── SettingsContext.tsx        # Theme, coordinate format & density state
├── data/
│   ├── mockMetrics.ts             # Centralized dashboard summary metrics
│   ├── mockObservations.ts        # SPHEREx multi-epoch calibration fields
│   ├── mockCandidates.ts          # Realistic candidate records with orbits & SEDs
│   └── mockSources.ts             # NASA/IPAC, JPL Horizons & schema provenance
├── lib/
│   └── astroUtils.ts              # RA/Dec conversions (HMS/DMS), separations & styling
├── services/
│   ├── apiClient.ts               # API abstraction layer with mock/live switch
│   ├── observationService.ts      # Observation queries & difference metrics
│   └── candidateService.ts        # Candidate triage queries & local notes state
└── types/
    ├── observation.ts             # Epoch & observation FITS metadata types
    ├── candidate.ts               # Candidate astrometry, spectra & notes types
    ├── settings.ts                # Theme, density & display preference types
    └── api.ts                     # Generic backend response envelopes
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:3000/](http://127.0.0.1:3000/) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🔌 Switching from Simulated Mock Data to Future Backend API

The frontend is completely decoupled from backend storage and database engines through a clean **Service Layer** (`src/services/`).

### Step 1: Set the API Base URL Environment Variable
Create or edit `.env.local` in the project root:
```env
VITE_API_BASE_URL=https://api.cosmic-blink.nasa.gov
```

### Step 2: Automatic Switch
`src/services/apiClient.ts` automatically detects `VITE_API_BASE_URL`:
- **When undefined or empty:** Runs in **In-Memory Simulated Mode** (mock data with realistic latency).
- **When defined:** Automatically forwards requests to your live REST/GraphQL endpoints:
  - `GET /api/v1/observations/epochs`
  - `GET /api/v1/observations`
  - `GET /api/v1/observations/diff?epochA=T1&epochB=T2`
  - `GET /api/v1/candidates`
  - `GET /api/v1/candidates/:id`
  - `PATCH /api/v1/candidates/:id/status`
  - `POST /api/v1/candidates/:id/notes`

No UI component rewriting is required when transitioning to the production backend.

---

## 🎨 Visual Design & Observational Features

- **Observatory Dark Aesthetics:** Tailored palette (`#070B14` base, `#0B1020` sidebars, `#101827` cards) with electric cyan (`#55D6FF`), violet (`#A78BFA`), and amber/magenta accents.
- **Interactive Sky Viewer:** Canvas-accelerated celestial field rendering coordinate grids, procedural stars, reticles, motion vectors, and candidate inspection drawers.
- **Blink Comparator & Difference Mapping:** 4 comparison modes including Swipe slider, synchronized Side-by-Side, classical Bipolar Dipole difference subtraction, and automated periodic frame blinking.
- **Scientific Plotly Charts:** Interactive Astrometric Trajectory tracks ($\Delta\alpha$ vs $\Delta\delta$) and SPHEREx 6-Band Infrared SED curves ($0.75 - 5.0\,\mu\text{m}$) with spectrophotometric error bars.
- **Provenance & Integrity:** Explicit badges and disclaimers stating that demo observations and scores are simulated illustrative models.

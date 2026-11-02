import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ExploreSkyPage } from '../pages/ExploreSkyPage';
import { OverviewPage } from '../pages/OverviewPage';
import { SkyExplorerPage } from '../pages/SkyExplorerPage';
import { ObservationComparisonPage } from '../pages/ObservationComparisonPage';
import { CandidateIntelligencePage } from '../pages/CandidateIntelligencePage';
import { CandidateDetailsPage } from '../pages/CandidateDetailsPage';
import { SettingsPage } from '../pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <ExploreSkyPage />
      },
      {
        path: 'overview',
        element: <OverviewPage />
      },
      {
        path: 'comparison',
        element: <ObservationComparisonPage />
      },
      {
        path: 'candidates',
        element: <CandidateIntelligencePage />
      },
      {
        path: 'candidates/:id',
        element: <CandidateDetailsPage />
      },
      {
        path: 'sky',
        element: <SkyExplorerPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

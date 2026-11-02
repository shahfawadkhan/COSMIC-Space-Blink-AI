import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { SettingsProvider } from './context/SettingsContext';

export function App() {
  return (
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  );
}

export default App;

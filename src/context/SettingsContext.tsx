import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSettings, ThemeMode } from '../types/settings';

const STORAGE_KEY = 'cosmic_settings_v3';

function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.theme === 'light-observatory' || parsed.theme === 'dark-observatory') {
        return parsed.theme;
      }
    }
  } catch (e) {
    console.warn('Could not read stored theme:', e);
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light-observatory';
    }
  }
  return 'dark-observatory';
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark-observatory',
  coordinateFormat: 'hms-dms',
  motionUnit: 'arcsec_per_hour',
  triageMotionThreshold: 0.2,
  defaultComparisonMode: 'swipe',
  defaultBlinkIntervalMs: 800,
  fitsStretch: 'asinh',
  dataSourceMode: 'mock',
  apiBaseUrl: 'http://localhost:8000/api/v1'
};

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  toggleTheme: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        let theme: ThemeMode = parsed.theme;
        if (theme !== 'dark-observatory' && theme !== 'light-observatory') {
          theme = 'dark-observatory';
        }
        return { ...DEFAULT_SETTINGS, ...parsed, theme };
      }
    } catch (e) {
      console.warn('Could not load user settings:', e);
    }
    return {
      ...DEFAULT_SETTINGS,
      theme: getInitialTheme()
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save user settings:', e);
    }

    const root = document.documentElement;
    if (settings.theme === 'light-observatory') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark-observatory' ? 'light-observatory' : 'dark-observatory'
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, toggleTheme, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

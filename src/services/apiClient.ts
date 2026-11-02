import { ApiResponse } from '../types/api';

/**
 * Backend API Client for COSMIC Space Blink.
 *
 * Checks either the dynamic user setting (from Settings page) or VITE_API_BASE_URL.
 * If set to 'api' mode, routes live HTTP requests. Otherwise serves local prototype catalog.
 */
function getActiveConfig(): { baseUrl: string; isMock: boolean } {
  try {
    const stored = localStorage.getItem('cosmic_settings_v3');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.dataSourceMode === 'api' && parsed.apiBaseUrl) {
        return { baseUrl: parsed.apiBaseUrl, isMock: false };
      }
    }
  } catch {}

  const envUrl = import.meta.env.VITE_API_BASE_URL || '';
  return {
    baseUrl: envUrl || 'http://localhost:8000/api/v1',
    isMock: !envUrl
  };
}

export const apiClient = {
  isMockMode(): boolean {
    return getActiveConfig().isMock;
  },

  getBaseUrl(): string {
    return getActiveConfig().baseUrl;
  },

  async mockFetch<T>(data: T, delayMs: number = 60): Promise<ApiResponse<T>> {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        isSimulated: true,
        simulatedLatencyMs: delayMs,
        dataSource: 'Local catalog dataset — NEP-04 survey region',
        version: '0.1.0-prototype'
      }
    };
  },

  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const { baseUrl, isMock } = getActiveConfig();
    if (isMock) {
      throw new Error(`Local simulation mode active. Cannot call live endpoint ${endpoint}.`);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
};

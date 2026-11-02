import {
  AstrometricAnalysisData,
  LightCurveData,
  SpectrumData,
  AnalysisSource,
} from '../types/analysis';
import {
  getMockAstrometricData,
  getMockLightCurveData,
  getMockSpectrumData,
  getMockAnalysisSources,
} from '../mocks/mockAnalysis';
import { apiClient } from './apiClient';

export const analysisService = {
  async getSources(): Promise<AnalysisSource[]> {
    if (apiClient.isMockMode()) {
      const res = await apiClient.mockFetch<AnalysisSource[]>(getMockAnalysisSources(), 80);
      return res.data;
    }
    const res = await apiClient.request<AnalysisSource[]>('/api/v1/analysis/sources');
    return res.data;
  },

  async getAstrometricData(sourceId: string): Promise<AstrometricAnalysisData | null> {
    if (apiClient.isMockMode()) {
      const data = getMockAstrometricData(sourceId);
      const res = await apiClient.mockFetch<AstrometricAnalysisData | null>(data, 100);
      return res.data;
    }
    const res = await apiClient.request<AstrometricAnalysisData>(`/api/v1/analysis/astrometry/${sourceId}`);
    return res.data;
  },

  async getLightCurveData(sourceId: string): Promise<LightCurveData | null> {
    if (apiClient.isMockMode()) {
      const data = getMockLightCurveData(sourceId);
      const res = await apiClient.mockFetch<LightCurveData | null>(data, 100);
      return res.data;
    }
    const res = await apiClient.request<LightCurveData>(`/api/v1/analysis/lightcurve/${sourceId}`);
    return res.data;
  },

  async getSpectrumData(sourceId: string): Promise<SpectrumData | null> {
    if (apiClient.isMockMode()) {
      const data = getMockSpectrumData(sourceId);
      const res = await apiClient.mockFetch<SpectrumData | null>(data, 100);
      return res.data;
    }
    const res = await apiClient.request<SpectrumData>(`/api/v1/analysis/spectrum/${sourceId}`);
    return res.data;
  },
};

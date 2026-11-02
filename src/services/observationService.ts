import {
  ObservationEpoch,
  ObservationMetadata,
  DifferenceMetric,
  EpochId,
  SkySearchRequest,
  SkySearchResponse,
  TargetPreset
} from '../types/observation';
import {
  MOCK_EPOCHS,
  MOCK_OBSERVATIONS,
  MOCK_DIFFERENCE_METRICS,
  findMockObservations
} from '../mocks/mockObservations';
import { TARGET_PRESETS } from '../mocks/presets';
import { apiClient } from './apiClient';

export const observationService = {
  /**
   * Retrieve standard astronomical target presets
   */
  getTargetPresets(): TargetPreset[] {
    return TARGET_PRESETS;
  },

  async getPresets(): Promise<TargetPreset[]> {
    if (apiClient.isMockMode()) {
      const res = await apiClient.mockFetch<TargetPreset[]>(TARGET_PRESETS, 50);
      return res.data;
    }
    const res = await apiClient.request<TargetPreset[]>('/api/v1/observations/presets');
    return res.data;
  },
  async getEpochs(): Promise<ObservationEpoch[]> {
    if (apiClient.isMockMode()) {
      const res = await apiClient.mockFetch<ObservationEpoch[]>(MOCK_EPOCHS, 100);
      return res.data;
    }
    const res = await apiClient.request<ObservationEpoch[]>('/api/v1/observations/epochs');
    return res.data;
  },

  async getObservations(): Promise<ObservationMetadata[]> {
    if (apiClient.isMockMode()) {
      const res = await apiClient.mockFetch<ObservationMetadata[]>(MOCK_OBSERVATIONS, 150);
      return res.data;
    }
    const res = await apiClient.request<ObservationMetadata[]>('/api/v1/observations');
    return res.data;
  },

  async getObservationById(id: string): Promise<ObservationMetadata | null> {
    if (apiClient.isMockMode()) {
      const match = MOCK_OBSERVATIONS.find(obs => obs.id === id) || null;
      const res = await apiClient.mockFetch<ObservationMetadata | null>(match, 80);
      return res.data;
    }
    const res = await apiClient.request<ObservationMetadata>(`/api/v1/observations/${id}`);
    return res.data;
  },

  async getObservationByEpoch(epoch: EpochId): Promise<ObservationMetadata | null> {
    if (apiClient.isMockMode()) {
      const match = MOCK_OBSERVATIONS.find(obs => obs.epoch === epoch) || null;
      const res = await apiClient.mockFetch<ObservationMetadata | null>(match, 80);
      return res.data;
    }
    const res = await apiClient.request<ObservationMetadata>(`/api/v1/observations/by-epoch/${epoch}`);
    return res.data;
  },

  async getDifferenceMetrics(epochA: EpochId, epochB: EpochId): Promise<DifferenceMetric[]> {
    if (apiClient.isMockMode()) {
      // In mock mode, we return the difference metrics for the epoch pair
      const res = await apiClient.mockFetch<DifferenceMetric[]>(MOCK_DIFFERENCE_METRICS, 120);
      return res.data;
    }
    const res = await apiClient.request<DifferenceMetric[]>(`/api/v1/observations/diff?epochA=${epochA}&epochB=${epochB}`);
    return res.data;
  },

  /**
   * Search for multi-epoch observations matching celestial coordinates and field of view.
   */
  async searchObservations(request: SkySearchRequest): Promise<SkySearchResponse> {
    if (apiClient.isMockMode()) {
      if (request.simulateError) {
        await new Promise(resolve => setTimeout(resolve, 350));
        throw new Error('Simulated catalog timeout: 504 Gateway Timeout while querying spatial coordinate index (test fixture).');
      }
      const mockResult = findMockObservations(request);
      const res = await apiClient.mockFetch<SkySearchResponse>(mockResult, 220);
      return res.data;
    }

    const params = new URLSearchParams({
      ra: request.ra.toString(),
      dec: request.dec.toString(),
      fov: request.fovArcmin.toString()
    });
    if (request.targetName) {
      params.append('target', request.targetName);
    }

    const res = await apiClient.request<SkySearchResponse>(`/api/v1/observations/search?${params.toString()}`);
    return res.data;
  }
};

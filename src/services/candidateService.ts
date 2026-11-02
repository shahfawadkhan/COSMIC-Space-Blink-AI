import { CandidateRecord, CandidateFilterParams, CandidateStatus, ReviewerNote } from '../types/candidate';
import { MOCK_CANDIDATES } from '../data/mockCandidates';
import { apiClient } from './apiClient';

const LOCAL_STORAGE_KEY = 'cosmic_candidates_state_v1';

function getStoredCandidates(): CandidateRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read candidates from localStorage:', e);
  }
  return [...MOCK_CANDIDATES];
}

function saveStoredCandidates(candidates: CandidateRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(candidates));
  } catch (e) {
    console.warn('Could not save candidates to localStorage:', e);
  }
}

export const candidateService = {
  async getCandidates(filters?: CandidateFilterParams): Promise<CandidateRecord[]> {
    if (apiClient.isMockMode()) {
      let list = getStoredCandidates();

      if (filters) {
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          list = list.filter(c => 
            c.id.toLowerCase().includes(q) ||
            c.crossMatch.matchedDesignation?.toLowerCase().includes(q) ||
            c.flaggedReason.toLowerCase().includes(q)
          );
        }
        if (filters.status && filters.status !== 'All') {
          list = list.filter(c => c.reviewStatus === filters.status);
        }
        if (filters.priority && filters.priority !== 'All') {
          list = list.filter(c => c.reviewPriority === filters.priority);
        }
        if (filters.minScore !== undefined) {
          list = list.filter(c => c.illustrativeScore >= (filters.minScore ?? 0));
        }
        if (filters.minEpochs !== undefined) {
          list = list.filter(c => c.epochCount >= (filters.minEpochs ?? 0));
        }
        if (filters.crossMatchFilter && filters.crossMatchFilter !== 'All') {
          list = list.filter(c => c.crossMatch.status === filters.crossMatchFilter);
        }

        if (filters.sortBy) {
          const key = filters.sortBy;
          const order = filters.sortOrder === 'desc' ? -1 : 1;
          list.sort((a, b) => {
            const valA = a[key];
            const valB = b[key];
            if (typeof valA === 'number' && typeof valB === 'number') {
              return (valA - valB) * order;
            }
            if (typeof valA === 'string' && typeof valB === 'string') {
              return valA.localeCompare(valB) * order;
            }
            return 0;
          });
        }
      }

      const res = await apiClient.mockFetch<CandidateRecord[]>(list, 100);
      return res.data;
    }

    const queryParams = new URLSearchParams();
    if (filters?.searchQuery) queryParams.set('q', filters.searchQuery);
    if (filters?.status && filters.status !== 'All') queryParams.set('status', filters.status);
    const res = await apiClient.request<CandidateRecord[]>(`/api/v1/candidates?${queryParams.toString()}`);
    return res.data;
  },

  async getCandidateById(id: string): Promise<CandidateRecord | null> {
    if (apiClient.isMockMode()) {
      const list = getStoredCandidates();
      const match = list.find(c => c.id === id) || null;
      const res = await apiClient.mockFetch<CandidateRecord | null>(match, 80);
      return res.data;
    }
    const res = await apiClient.request<CandidateRecord>(`/api/v1/candidates/${id}`);
    return res.data;
  },

  async updateCandidateStatus(id: string, status: CandidateStatus): Promise<CandidateRecord | null> {
    if (apiClient.isMockMode()) {
      const list = getStoredCandidates();
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          reviewStatus: status
        };
        saveStoredCandidates(list);
        const res = await apiClient.mockFetch<CandidateRecord>(list[idx], 50);
        return res.data;
      }
      return null;
    }
    const res = await apiClient.request<CandidateRecord>(`/api/v1/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.data;
  },

  async addReviewerNote(id: string, content: string, author: string = 'Local Investigator'): Promise<CandidateRecord | null> {
    if (apiClient.isMockMode()) {
      const list = getStoredCandidates();
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        const newNote: ReviewerNote = {
          id: `note-${Date.now()}`,
          author,
          timestamp: new Date().toISOString(),
          content
        };
        list[idx] = {
          ...list[idx],
          notes: [newNote, ...list[idx].notes]
        };
        saveStoredCandidates(list);
        const res = await apiClient.mockFetch<CandidateRecord>(list[idx], 50);
        return res.data;
      }
      return null;
    }
    const res = await apiClient.request<CandidateRecord>(`/api/v1/candidates/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, author })
    });
    return res.data;
  },

  resetToDefaultMock(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Error resetting candidates:', e);
    }
  }
};

/**
 * Standard API envelope for COSMIC Space Blink AI.
 * Prepared for future backend integration with NASA/IPAC SPHEREx processing pipeline.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata: {
    timestamp: string;
    isSimulated: boolean;
    simulatedLatencyMs: number;
    dataSource: string;
    version: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiStatusCheck {
  healthy: boolean;
  activeBackend: 'MOCK_IN_MEMORY' | 'REMOTE_API';
  apiBaseUrl?: string;
  archiveStatus: {
    spherexArchive: string;
    jplHorizons: string;
    jplSBD: string;
  };
}

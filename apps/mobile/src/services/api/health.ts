import type { HealthResponse } from '@irife/contracts';
import { apiRequest } from './client';

export function getApiHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/api/v1/health');
}

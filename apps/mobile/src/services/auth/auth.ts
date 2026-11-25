import { ApiClientError, apiRequest } from '../api/client';
import { createAuthenticatedRequest } from './authenticated-request.mjs';

const authenticatedRequest = createAuthenticatedRequest({
  readSession: readStoredSession,
  refreshSession,
  apiRequest,
});

export async function authenticatedApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return authenticatedRequest<T>(path, init);
}

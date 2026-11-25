import { ApiClientError } from '../api/client';
import { createAuthenticatedRequest } from './authenticated-request.mjs';

export function createAuthenticatedRequest({
  readSession,
  refreshSession,
  apiRequest,
}: {
  readSession: () => Promise<{ accessToken: string } | null>;
  refreshSession: (session: { accessToken: string }) => Promise<{ accessToken: string } | null>;
  apiRequest: <T>(path: string, init?: RequestInit) => Promise<T>;
}): <T>(path: string, init?: RequestInit) => Promise<T> {
  return createAuthenticatedRequest({ readSession, refreshSession, apiRequest });
}

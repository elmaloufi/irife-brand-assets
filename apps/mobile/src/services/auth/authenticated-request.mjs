import { ApiClientError } from '../api/client.mjs';

export function createAuthenticatedRequest({ readSession, refreshSession, apiRequest }) {
  return async function authenticatedApiRequest(path, init = {}) {
    const session = await readSession();
    if (!session) throw new ApiClientError('Sign in to continue.', 401, 'AUTHENTICATION_REQUIRED');

    const send = (accessToken) => {
      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${accessToken}`);
      return apiRequest(path, { ...init, headers });
    };

    try {
      return await send(session.accessToken);
    } catch (error) {
      if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
      const refreshed = await refreshSession(session);
      if (!refreshed) throw error;
      return send(refreshed.accessToken);
    }
  };
}

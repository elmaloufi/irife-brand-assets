import * as SecureStore from 'expo-secure-store';
import { ApiClientError, apiRequest } from '../api/client';

const SESSION_KEY = 'irife.auth.session.v1';
export interface AuthUser { id: string; email: string; displayName: string; role: 'TRAVELER' | 'ADMIN'; }
export interface AuthSession { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; user: AuthUser; }
export interface AccountSession { id: string; createdAt: string; lastUsedAt: string | null; isCurrent: boolean; }
interface TokenResponse { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; }
let refreshInFlight: Promise<AuthSession | null> | null = null;

async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
}
export async function readStoredSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (typeof parsed.accessToken !== 'string' || typeof parsed.refreshToken !== 'string' || !parsed.user || typeof parsed.user.id !== 'string' || typeof parsed.user.email !== 'string' || typeof parsed.user.displayName !== 'string') {
      await clearStoredSession(); return null;
    }
    return parsed as AuthSession;
  } catch { await clearStoredSession(); return null; }
}
export async function clearStoredSession(): Promise<void> { await SecureStore.deleteItemAsync(SESSION_KEY); }
async function authenticate(path: '/api/v1/identity/login' | '/api/v1/identity/register', body: Record<string, string>): Promise<AuthSession> {
  const response = await apiRequest<AuthSession>(path, { method: 'POST', body: JSON.stringify(body) });
  await saveSession(response); return response;
}
export function signIn(email: string, password: string): Promise<AuthSession> {
  return authenticate('/api/v1/identity/login', { email: email.trim().toLowerCase(), password });
}
export function signUp(displayName: string, email: string, password: string): Promise<AuthSession> {
  return authenticate('/api/v1/identity/register', { displayName: displayName.trim(), email: email.trim().toLowerCase(), password });
}
export async function refreshSession(current: AuthSession): Promise<AuthSession | null> {
  if (refreshInFlight) return refreshInFlight;

  // A different request may have rotated this token after this caller read its
  // session. Never replay an older refresh token: the server treats replay as
  // token theft and revokes the entire session family.
  const latest = await readStoredSession();
  if (!latest) return null;
  if (latest.refreshToken !== current.refreshToken) return latest;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const tokens = await apiRequest<TokenResponse>('/api/v1/identity/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: latest.refreshToken }),
      });
      const rotated = { ...latest, ...tokens };
      await saveSession(rotated);
      return rotated;
    } catch {
      // A concurrent request may have completed rotation while this response
      // was failing. Preserve the newer credentials if they are already saved.
      const currentStored = await readStoredSession();
      if (currentStored && currentStored.refreshToken !== latest.refreshToken) return currentStored;
      await clearStoredSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
export async function getCurrentUser(session: AuthSession): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/identity/me', { headers: { Authorization: `Bearer ${session.accessToken}` } });
}
export async function getAccountSessions(session: AuthSession): Promise<AccountSession[]> {
  return authenticatedApiRequest<AccountSession[]>('/api/v1/identity/sessions', { headers: { Authorization: `Bearer ${session.accessToken}` } });
}
export async function revokeAccountSession(session: AuthSession, sessionId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/identity/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } });
}
export async function updateAccountPassword(session: AuthSession, currentPassword: string, newPassword: string): Promise<void> {
  return authenticatedApiRequest<void>('/api/v1/identity/password', { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}` }, body: JSON.stringify({ currentPassword, newPassword }) });
}
export async function restoreSession(session: AuthSession): Promise<AuthSession | null> {
  try {
    const user = await getCurrentUser(session); const current = { ...session, user }; await saveSession(current); return current;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      const refreshed = await refreshSession(session); if (!refreshed) return null;
      try { const user = await getCurrentUser(refreshed); const current = { ...refreshed, user }; await saveSession(current); return current; }
      catch { await clearStoredSession(); return null; }
    }
    return session;
  }
}
export async function signOut(session: AuthSession | null): Promise<void> {
  try {
    if (session) await authenticatedApiRequest<void>('/api/v1/identity/logout', { method: 'POST' });
  } finally { await clearStoredSession(); }
}

export async function authenticatedApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await readStoredSession();
  if (!session) throw new ApiClientError('Sign in to continue.', 401, 'AUTHENTICATION_REQUIRED');
  const send = (accessToken: string) => {
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    return apiRequest<T>(path, { ...init, headers });
  };
  try {
    return await send(session.accessToken);
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
    const refreshed = await refreshSession(session);
    if (!refreshed) throw error;
    return send(refreshed.accessToken);
  }
}

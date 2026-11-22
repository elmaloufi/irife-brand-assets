import * as SecureStore from 'expo-secure-store';
import { ApiClientError, apiRequest } from '../api/client';

const SESSION_KEY = 'irife.auth.session.v1';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'TRAVELER' | 'ADMIN';
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

let refreshInFlight: Promise<AuthSession | null> | null = null;

async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function readStoredSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      !parsed.user ||
      typeof parsed.user.id !== 'string' ||
      typeof parsed.user.email !== 'string' ||
      typeof parsed.user.displayName !== 'string'
    ) {
      await clearStoredSession();
      return null;
    }
    return parsed as AuthSession;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

async function authenticate(path: '/api/v1/identity/login' | '/api/v1/identity/register', body: Record<string, string>): Promise<AuthSession> {
  const response = await apiRequest<AuthSession>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  await saveSession(response);
  return response;
}

export function signIn(email: string, password: string): Promise<AuthSession> {
  return authenticate('/api/v1/identity/login', { email: email.trim().toLowerCase(), password });
}

export function signUp(displayName: string, email: string, password: string): Promise<AuthSession> {
  return authenticate('/api/v1/identity/register', {
    displayName: displayName.trim(),
    email: email.trim().toLowerCase(),
    password,
  });
}

export async function refreshSession(current: AuthSession): Promise<AuthSession | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const tokens = await apiRequest<TokenResponse>('/api/v1/identity/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      const next = { ...current, ...tokens };
      await saveSession(next);
      return next;
    } catch {
      await clearStoredSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function getCurrentUser(session: AuthSession): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/identity/me', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
}

export async function restoreSession(session: AuthSession): Promise<AuthSession | null> {
  try {
    const user = await getCurrentUser(session);
    const current = { ...session, user };
    await saveSession(current);
    return current;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      const refreshed = await refreshSession(session);
      if (!refreshed) return null;
      try {
        const user = await getCurrentUser(refreshed);
        const current = { ...refreshed, user };
        await saveSession(current);
        return current;
      } catch {
        await clearStoredSession();
        return null;
      }
    }
    // A temporary network failure must not silently destroy a valid local session.
    return session;
  }
}

export async function signOut(session: AuthSession | null): Promise<void> {
  try {
    if (session) {
      await apiRequest<void>('/api/v1/identity/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
    }
  } finally {
    await clearStoredSession();
  }
}

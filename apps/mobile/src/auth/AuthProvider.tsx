import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  clearStoredSession,
  readStoredSession,
  restoreSession,
  signIn as requestSignIn,
  signOut as requestSignOut,
  signUp as requestSignUp,
  type AuthSession,
  type AuthUser,
} from '../services/auth/auth';

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(displayName: string, email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  clearError(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readableError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await readStoredSession();
        if (!stored) return;
        const restored = await restoreSession(stored);
        if (active) setSession(restored);
      } catch {
        await clearStoredSession();
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const next = await requestSignIn(email, password);
      setSession(next);
    } catch (cause) {
      setError(readableError(cause));
      throw cause;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const next = await requestSignUp(displayName, email, password);
      setSession(next);
    } catch (cause) {
      setError(readableError(cause));
      throw cause;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await requestSignOut(session);
    } finally {
      // Clear in-memory identity even if the network is unavailable. The local
      // refresh credential is removed by requestSignOut's finally block.
      setSession(null);
      setIsSubmitting(false);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    isLoading,
    isSubmitting,
    error,
    signIn,
    signUp,
    signOut,
    clearError: () => setError(null),
  }), [session, isLoading, isSubmitting, error, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}

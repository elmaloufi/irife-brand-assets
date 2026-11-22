import { Appearance } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { DEFAULT_PREFERENCES, loadPreferences, savePreferences, type AppPreferences } from './preferences';

interface PreferencesContextValue {
  preferences: AppPreferences;
  isLoading: boolean;
  error: string | null;
  updatePreferences(next: AppPreferences): Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function applyAppearance(appearance: AppPreferences['appearance']) {
  Appearance.setColorScheme(appearance === 'system' ? 'unspecified' : appearance);
}

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadPreferences().then((stored) => {
      if (!active) return;
      setPreferences(stored);
      applyAppearance(stored.appearance);
    }).catch(() => {
      if (active) setError('Could not load preferences from secure device storage.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const updatePreferences = useCallback(async (next: AppPreferences) => {
    setError(null);
    try {
      await savePreferences(next);
      const validated = { ...DEFAULT_PREFERENCES, ...next };
      setPreferences(validated);
      applyAppearance(validated.appearance);
    } catch {
      setError('Your change could not be saved. Please try again.');
      throw new Error('PREFERENCES_SAVE_FAILED');
    }
  }, []);

  const value = useMemo(() => ({ preferences, isLoading, error, updatePreferences }), [preferences, isLoading, error, updatePreferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider.');
  return value;
}

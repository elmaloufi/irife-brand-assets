import * as SecureStore from 'expo-secure-store';

const PREFERENCES_KEY = 'irife.preferences.v1';

export type AppLanguage = 'en' | 'fr' | 'ar' | 'es' | 'de' | 'pt' | 'it' | 'zh' | 'ja' | 'tr' | 'nl';
export type AppCurrency = 'MAD' | 'EUR' | 'USD';
export type AppAppearance = 'system' | 'light' | 'dark';
export type DistanceUnit = 'km' | 'mi';

export interface AppPreferences {
  language: AppLanguage;
  currency: AppCurrency;
  appearance: AppAppearance;
  distanceUnit: DistanceUnit;
  region: string;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  language: 'en',
  currency: 'MAD',
  appearance: 'system',
  distanceUnit: 'km',
  region: 'MA',
};

const languages: AppLanguage[] = ['en', 'fr', 'ar', 'es', 'de', 'pt', 'it', 'zh', 'ja', 'tr', 'nl'];
const currencies: AppCurrency[] = ['MAD', 'EUR', 'USD'];
const appearances: AppAppearance[] = ['system', 'light', 'dark'];
const distanceUnits: DistanceUnit[] = ['km', 'mi'];

export function validatePreferences(value: unknown): AppPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_PREFERENCES;
  const candidate = value as Partial<AppPreferences>;
  return {
    language: languages.includes(candidate.language as AppLanguage) ? candidate.language as AppLanguage : DEFAULT_PREFERENCES.language,
    currency: currencies.includes(candidate.currency as AppCurrency) ? candidate.currency as AppCurrency : DEFAULT_PREFERENCES.currency,
    appearance: appearances.includes(candidate.appearance as AppAppearance) ? candidate.appearance as AppAppearance : DEFAULT_PREFERENCES.appearance,
    distanceUnit: distanceUnits.includes(candidate.distanceUnit as DistanceUnit) ? candidate.distanceUnit as DistanceUnit : DEFAULT_PREFERENCES.distanceUnit,
    region: typeof candidate.region === 'string' && /^[A-Za-z]{2}$/.test(candidate.region) ? candidate.region.toUpperCase() : DEFAULT_PREFERENCES.region,
  };
}

export async function loadPreferences(): Promise<AppPreferences> {
  const stored = await SecureStore.getItemAsync(PREFERENCES_KEY);
  if (!stored) return DEFAULT_PREFERENCES;
  try {
    return validatePreferences(JSON.parse(stored));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(preferences: AppPreferences): Promise<void> {
  await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(validatePreferences(preferences)));
}

export async function resetPreferences(): Promise<void> {
  await SecureStore.deleteItemAsync(PREFERENCES_KEY);
}

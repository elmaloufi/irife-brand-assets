export const translations: Record<string, Record<string, string>>;
export function normalizeLanguage(language: string): 'en' | 'fr' | 'ar' | 'es' | 'de' | 'pt' | 'it' | 'zh' | 'ja' | 'tr' | 'nl';
export function resolveLocale(language: string, region?: string): string;
export function isRightToLeft(language: string): boolean;
export function translate(language: string, key: string): string;
export function formatCurrency(amount: number, currency: string, locale?: string): string;
export function formatDistance(distanceKm: number, unit: string, locale?: string): string;

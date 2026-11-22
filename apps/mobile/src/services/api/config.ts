const DEFAULT_TIMEOUT_MS = 10_000;

export function getApiBaseUrl(configuredUrl = process.env.EXPO_PUBLIC_API_URL): string {
  if (!configuredUrl?.trim()) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is missing. Set it to the API address reachable from this device.',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(configuredUrl.trim());
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL must be a valid absolute HTTP or HTTPS URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('EXPO_PUBLIC_API_URL must use HTTP(S) and must not contain credentials.');
  }
  if (parsed.search || parsed.hash) {
    throw new Error('EXPO_PUBLIC_API_URL must not contain a query string or fragment.');
  }

  return parsed.toString().replace(/\/+$/, '');
}

export { DEFAULT_TIMEOUT_MS };

import { apiRequest } from './client';
import { cachedRequest } from './request-cache.mjs';
import { authenticatedApiRequest } from '../auth/auth';

export interface WeatherResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: Record<string, unknown>;
  timezone?: string;
}

export interface GeocodingResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: Record<string, string>;
}

export interface ItriMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function getWeather(latitude: number, longitude: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const path = `/api/v1/integrations/weather?${params.toString()}`;
  return cachedRequest(path, () => apiRequest<WeatherResponse>(path), 10 * 60_000);
}

export function geocodePlace(query: string, language: 'ar' | 'en' | 'fr' | 'es' = 'en'): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({ q: query.trim(), language });
  const path = `/api/v1/integrations/geocoding?${params.toString()}`;
  return cachedRequest(path, () => apiRequest<GeocodingResult[]>(path), 30 * 24 * 60 * 60_000);
}

export function getCityEvents(city: string, size = 20): Promise<unknown> {
  const params = new URLSearchParams({ city, countryCode: 'MA', size: String(size) });
  const path = `/api/v1/integrations/events?${params.toString()}`;
  return cachedRequest(path, () => apiRequest<unknown>(path), 5 * 60_000);
}

export function sendItriMessage(messages: ItriMessage[]): Promise<unknown> {
  return authenticatedApiRequest<unknown>('/api/v1/integrations/itri/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}

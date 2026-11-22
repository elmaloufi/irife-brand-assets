import { cachedRequest } from './request-cache.mjs';
import type {
  DestinationSummary,
  ExperienceCard,
  PaginatedResponse,
} from '@irife/contracts';
import { apiRequest } from './client';

export interface DiscoveryQuery {
  page?: number;
  limit?: number;
  destinationId?: string;
}

function toQueryString(query: DiscoveryQuery): string {
  const params = new URLSearchParams();
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 20));
  if (query.destinationId) params.set('destinationId', query.destinationId);
  return params.toString();
}

export function getDestinations(
  query: Pick<DiscoveryQuery, 'page' | 'limit'> = {},
): Promise<PaginatedResponse<DestinationSummary>> {
  const path = `/api/v1/destinations?${toQueryString(query)}`;
  return cachedRequest(path, () => apiRequest(path), 30_000);
}

export function getExperiences(
  query: DiscoveryQuery = {},
): Promise<PaginatedResponse<ExperienceCard>> {
  const path = `/api/v1/experiences?${toQueryString(query)}`;
  return cachedRequest(path, () => apiRequest(path), 30_000);
}

export async function getExperienceById(id: string) {
  const path = `/api/v1/experiences/${encodeURIComponent(id)}`;
  return cachedRequest(path, () => apiRequest<import('@irife/contracts').ExperienceDetail>(path), 60_000);
}

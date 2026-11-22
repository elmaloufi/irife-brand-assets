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
  return apiRequest(`/api/v1/destinations?${toQueryString(query)}`);
}

export function getExperiences(
  query: DiscoveryQuery = {},
): Promise<PaginatedResponse<ExperienceCard>> {
  return apiRequest(`/api/v1/experiences?${toQueryString(query)}`);
}

export async function getExperienceById(id: string) {
  return apiRequest<import('@irife/contracts').ExperienceDetail>(
    `/api/v1/experiences/${encodeURIComponent(id)}`,
  );
}

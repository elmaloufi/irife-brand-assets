import type { SavedExperienceSummary } from '@irife/contracts';
import { authenticatedApiRequest } from '../auth/auth';

export function getMySavedExperiences(): Promise<SavedExperienceSummary[]> {
  return authenticatedApiRequest('/api/v1/me/saved-experiences');
}

export function saveExperience(experienceId: string): Promise<SavedExperienceSummary> {
  return authenticatedApiRequest(`/api/v1/me/saved-experiences/${encodeURIComponent(experienceId)}`, { method: 'POST' });
}

export function removeSavedExperience(experienceId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/me/saved-experiences/${encodeURIComponent(experienceId)}`, { method: 'DELETE' });
}

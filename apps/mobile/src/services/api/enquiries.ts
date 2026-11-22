import type { EnquirySummary, PaginatedResponse } from '@irife/contracts';
import { authenticatedApiRequest } from '../auth/auth';

export interface CreateEnquiryInput {
  experienceId: string;
  guestCount: number;
  message: string;
  requestedStartAt?: string;
}

export function createEnquiry(input: CreateEnquiryInput): Promise<EnquirySummary> {
  return authenticatedApiRequest('/api/v1/enquiries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getMyEnquiries(page = 1, limit = 20): Promise<PaginatedResponse<EnquirySummary>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return authenticatedApiRequest(`/api/v1/me/enquiries?${params.toString()}`);
}

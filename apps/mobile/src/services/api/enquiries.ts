import type { CreateEnquiryInput, EnquirySummary, PaginatedResponse } from '@irife/contracts';
import type { AuthSession } from '../auth/auth';
import { apiRequest } from './client';
const authHeaders = (session: AuthSession) => ({ Authorization: `Bearer ${session.accessToken}` });
export function createEnquiry(session: AuthSession, input: CreateEnquiryInput): Promise<EnquirySummary> {
  return apiRequest('/api/v1/enquiries', { method: 'POST', headers: authHeaders(session), body: JSON.stringify(input) });
}
export function getMyEnquiries(session: AuthSession, page = 1, limit = 20): Promise<PaginatedResponse<EnquirySummary>> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest(`/api/v1/me/enquiries?${query.toString()}`, { headers: authHeaders(session) });
}
export function cancelMyEnquiry(session: AuthSession, id: string): Promise<EnquirySummary> {
  return apiRequest(`/api/v1/me/enquiries/${encodeURIComponent(id)}/cancel`, { method: 'POST', headers: authHeaders(session) });
}

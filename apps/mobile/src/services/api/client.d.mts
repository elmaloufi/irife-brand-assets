export interface ApiErrorPayload {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  requestId?: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  constructor(message: string, status: number, code: string, requestId?: string);
}

export interface ApiRequestOptions<T> {
  baseUrl?: string;
  timeoutMs?: number;
  validateResponse?: (payload: unknown) => payload is T;
}

export function apiRequest<T>(path: string, init?: RequestInit, options?: ApiRequestOptions<T>): Promise<T>;

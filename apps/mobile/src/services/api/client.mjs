import { DEFAULT_TIMEOUT_MS, getApiBaseUrl } from './config.mjs';

export class ApiClientError extends Error {
  constructor(message, status, code, requestId) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export async function apiRequest(path, init = {}, options = {}) {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('API paths must be relative paths beginning with one slash.');
  }

  const baseUrl = options.baseUrl ?? getApiBaseUrl();
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (response.status === 204) return undefined;

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ApiClientError('The API returned an invalid JSON response.', response.status, 'INVALID_RESPONSE');
    }

    if (!response.ok) {
      const error = payload && typeof payload === 'object' ? payload : {};
      const message = Array.isArray(error.message)
        ? error.message.join(', ')
        : typeof error.message === 'string'
          ? error.message
          : 'The request could not be completed.';
      throw new ApiClientError(message, response.status, error.code ?? 'HTTP_ERROR', error.requestId);
    }

    if (options.validateResponse && !options.validateResponse(payload)) {
      throw new ApiClientError('The API returned a response that did not match the expected format.', response.status, 'INVALID_RESPONSE');
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (controller.signal.aborted) {
      throw new ApiClientError('The request timed out. Check your connection and try again.', 0, 'REQUEST_TIMEOUT');
    }
    throw new ApiClientError('Unable to reach the IRIFE API. Check the device network and API address.', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

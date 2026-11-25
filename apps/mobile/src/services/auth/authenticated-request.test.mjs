import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClientError } from '../api/client.mjs';
import { createAuthenticatedRequest } from './authenticated-request.mjs';

const session = { accessToken: 'access-old', refreshToken: 'refresh-old' };

test('adds a bearer access-token header and preserves caller headers', async () => {
  let captured;
  const request = createAuthenticatedRequest({
    readSession: async () => session,
    refreshSession: async () => null,
    apiRequest: async (_path, init) => { captured = init; return { ok: true }; },
  });
  await request('/api/v1/me', { headers: { 'X-Request-Id': 'r1' } });
  assert.equal(captured.headers.get('Authorization'), 'Bearer access-old');
  assert.equal(captured.headers.get('X-Request-Id'), 'r1');
});

test('refreshes an expired access token once and retries with the rotated token', async () => {
  const tokens = [];
  let refreshCalls = 0;
  const request = createAuthenticatedRequest({
    readSession: async () => session,
    refreshSession: async () => { refreshCalls += 1; return { accessToken: 'access-new', refreshToken: 'refresh-new' }; },
    apiRequest: async (_path, init) => {
      tokens.push(init.headers.get('Authorization'));
      if (tokens.length === 1) throw new ApiClientError('expired', 401, 'INVALID_SESSION');
      return { result: 'ok' };
    },
  });
  assert.deepEqual(await request('/api/v1/me'), { result: 'ok' });
  assert.deepEqual(tokens, ['Bearer access-old', 'Bearer access-new']);
  assert.equal(refreshCalls, 1);
});

test('clears neither session nor retries on network and timeout failures', async () => {
  let refreshCalls = 0;
  let calls = 0;
  const request = createAuthenticatedRequest({
    readSession: async () => session,
    refreshSession: async () => { refreshCalls += 1; return null; },
    apiRequest: async () => { calls += 1; throw new ApiClientError('offline', 0, 'NETWORK_ERROR'); },
  });
  await assert.rejects(request('/api/v1/me'), (error) => error.code === 'NETWORK_ERROR');
  assert.equal(calls, 1);
  assert.equal(refreshCalls, 0);
});

test('returns authentication-required without sending a request when session is absent', async () => {
  let calls = 0;
  const request = createAuthenticatedRequest({
    readSession: async () => null,
    refreshSession: async () => null,
    apiRequest: async () => { calls += 1; },
  });
  await assert.rejects(request('/api/v1/me'), (error) => error.code === 'AUTHENTICATION_REQUIRED' && error.status === 401);
  assert.equal(calls, 0);
});

test('does not retry a rejected request when refresh reports an expired session', async () => {
  let calls = 0;
  const request = createAuthenticatedRequest({
    readSession: async () => session,
    refreshSession: async () => null,
    apiRequest: async () => { calls += 1; throw new ApiClientError('expired', 401, 'INVALID_SESSION'); },
  });
  await assert.rejects(request('/api/v1/me'), (error) => error.code === 'INVALID_SESSION');
  assert.equal(calls, 1);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { restoreSessionWithFallback } from './restore-session-fallback.mjs';

const stored = { accessToken: 'expired-access', refreshToken: 'valid-refresh', user: { id: 'traveler-1' } };

test('preserves the encrypted local session when the API is unreachable during startup', async () => {
  const result = await restoreSessionWithFallback(stored, async () => { throw new Error('NETWORK_ERROR'); });
  assert.equal(result, stored);
});

test('respects an explicit invalid-session result from the auth service', async () => {
  const result = await restoreSessionWithFallback(stored, async () => null);
  assert.equal(result, null);
});

test('does not invoke restoration when no local session exists', async () => {
  let called = false;
  const result = await restoreSessionWithFallback(null, async () => { called = true; return stored; });
  assert.equal(result, null);
  assert.equal(called, false);
});

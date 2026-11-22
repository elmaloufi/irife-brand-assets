import assert from 'node:assert/strict';
import test from 'node:test';
import { isUnauthorizedApiError } from './session-error.mjs';

test('classifies an HTTP 401 as a terminal authentication failure', () => {
  assert.equal(isUnauthorizedApiError({ status: 401, code: 'INVALID_SESSION' }), true);
});

test('does not classify network failures as terminal authentication failures', () => {
  assert.equal(isUnauthorizedApiError({ status: 0, code: 'NETWORK_ERROR' }), false);
  assert.equal(isUnauthorizedApiError({ status: 0, code: 'REQUEST_TIMEOUT' }), false);
});

test('does not classify server errors or ordinary errors as terminal', () => {
  assert.equal(isUnauthorizedApiError({ status: 503, code: 'SERVICE_UNAVAILABLE' }), false);
  assert.equal(isUnauthorizedApiError(new Error('unexpected failure')), false);
  assert.equal(isUnauthorizedApiError(null), false);
});

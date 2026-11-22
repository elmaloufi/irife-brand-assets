import test from 'node:test';
import assert from 'node:assert/strict';
import {
  API_ERROR_FIELDS,
  DATABASE_STATUSES,
  HEALTH_RESPONSE_STATUSES,
  HEALTH_SERVICE,
} from '../dist/index.js';

test('API error contract exposes the approved fields in stable order', () => {
  assert.deepEqual(API_ERROR_FIELDS, ['statusCode', 'code', 'message', 'requestId']);
});

test('health contract exposes only the approved status values', () => {
  assert.deepEqual(HEALTH_RESPONSE_STATUSES, ['ok', 'degraded']);
  assert.deepEqual(DATABASE_STATUSES, ['up', 'down']);
  assert.equal(HEALTH_SERVICE, 'irife-api');
});

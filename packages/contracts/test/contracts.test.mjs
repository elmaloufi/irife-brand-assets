import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path) =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

test('ApiError defines the approved stable error envelope', () => {
  const code = source('../src/common/api-error.ts');
  assert.match(code, /export interface ApiError\s*\{/);
  for (const field of ['statusCode: number', 'code: string', 'message: string', 'requestId: string']) {
    assert.ok(code.includes(field), `ApiError must include ${field}`);
  }
});

test('HealthResponse defines the approved service and database status contract', () => {
  const code = source('../src/health/health-response.ts');
  assert.match(code, /status:.*ok.*degraded/s);
  assert.match(code, /service:.*irife-api/s);
  assert.match(code, /timestamp:\s*string/);
  assert.match(code, /database:.*up.*down/s);
});

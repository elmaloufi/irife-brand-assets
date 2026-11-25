import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiClientError, apiRequest } from './client.mjs';

const baseUrl = 'http://localhost:3000';
const originalFetch = globalThis.fetch;

test('rejects absolute and protocol-relative paths before network access', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('unexpected network call'); };
  try {
    await assert.rejects(apiRequest('https://example.com', {}, { baseUrl }), /relative paths/);
    await assert.rejects(apiRequest('//example.com/path', {}, { baseUrl }), /relative paths/);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sends JSON and caller headers while preserving Accept and content type defaults', async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    assert.deepEqual(await apiRequest('/api/v1/test', { method: 'POST', body: '{}' , headers: { 'X-Trace': 'trace-1' } }, { baseUrl }), { ok: true });
    assert.equal(request.url, `${baseUrl}/api/v1/test`);
    assert.equal(request.init.headers.get('Accept'), 'application/json');
    assert.equal(request.init.headers.get('Content-Type'), 'application/json');
    assert.equal(request.init.headers.get('X-Trace'), 'trace-1');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('returns undefined for 204 responses without attempting JSON parsing', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  try {
    assert.equal(await apiRequest('/api/v1/logout', {}, { baseUrl }), undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('normalizes API error envelope including array messages and request id', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ code: 'INVALID_INPUT', message: ['bad email', 'bad name'], requestId: 'req-7' }), { status: 422 });
  try {
    await assert.rejects(apiRequest('/api/v1/test', {}, { baseUrl }), (error) => {
      assert.ok(error instanceof ApiClientError);
      assert.equal(error.status, 422);
      assert.equal(error.code, 'INVALID_INPUT');
      assert.equal(error.message, 'bad email, bad name');
      assert.equal(error.requestId, 'req-7');
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects malformed JSON and schema-invalid successful responses distinctly', async () => {
  globalThis.fetch = async () => new Response('{not json', { status: 200 });
  try {
    await assert.rejects(apiRequest('/api/v1/test', {}, { baseUrl }), (error) => error.code === 'INVALID_RESPONSE' && error.status === 200);
  } finally {
    globalThis.fetch = originalFetch;
  }

  globalThis.fetch = async () => new Response(JSON.stringify({ value: 'wrong' }), { status: 200 });
  try {
    await assert.rejects(apiRequest('/api/v1/test', {}, { baseUrl, validateResponse: (value) => typeof value.value === 'number' }), (error) => error.code === 'INVALID_RESPONSE');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('normalizes network errors and abort timeouts without retrying automatically', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new TypeError('offline'); };
  try {
    await assert.rejects(apiRequest('/api/v1/test', {}, { baseUrl }), (error) => error.code === 'NETWORK_ERROR');
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }

  globalThis.fetch = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  try {
    await assert.rejects(apiRequest('/api/v1/test', {}, { baseUrl, timeoutMs: 1 }), (error) => error.code === 'REQUEST_TIMEOUT');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

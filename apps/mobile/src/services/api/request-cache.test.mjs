import assert from 'node:assert/strict';
import test from 'node:test';
import { cachedRequest, clearRequestCache } from './request-cache.mjs';

test('caches a successful result for its TTL', async () => {
  clearRequestCache();
  let calls = 0;
  const loader = async () => ({ value: ++calls });
  const first = await cachedRequest('destinations:all', loader, 30_000);
  const second = await cachedRequest('destinations:all', loader, 30_000);
  assert.deepEqual(first, { value: 1 });
  assert.deepEqual(second, { value: 1 });
  assert.equal(calls, 1);
});

test('deduplicates concurrent requests for the same key', async () => {
  clearRequestCache();
  let calls = 0;
  let resolve;
  const loader = () => {
    calls += 1;
    return new Promise((done) => { resolve = done; });
  };
  const first = cachedRequest('experiences:all', loader);
  const second = cachedRequest('experiences:all', loader);
  assert.equal(calls, 0);
  await Promise.resolve();
  assert.equal(calls, 1);
  resolve(['one']);
  assert.deepEqual(await first, ['one']);
  assert.deepEqual(await second, ['one']);
});

test('does not cache rejected requests', async () => {
  clearRequestCache();
  let calls = 0;
  await assert.rejects(cachedRequest('experiences:failed', async () => {
    calls += 1;
    throw new Error('offline');
  }), /offline/);
  const value = await cachedRequest('experiences:failed', async () => {
    calls += 1;
    return 'recovered';
  });
  assert.equal(value, 'recovered');
  assert.equal(calls, 2);
});

test('expires an entry when its TTL is zero', async () => {
  clearRequestCache();
  let calls = 0;
  const loader = async () => ++calls;
  await cachedRequest('short-lived', loader, 0);
  await cachedRequest('short-lived', loader, 0);
  assert.equal(calls, 2);
});

import { describe, expect, it } from '@jest/globals';
import { ProviderCache } from './provider-cache.js';

describe('ProviderCache', () => {
  it('coalesces concurrent requests and caches successful values', async () => {
    const cache = new ProviderCache();
    let calls = 0;
    const loader = async () => { calls += 1; return { ok: true }; };
    const [first, second] = await Promise.all([
      cache.remember('weather:one', 10_000, loader),
      cache.remember('weather:one', 10_000, loader),
    ]);
    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(calls).toBe(1);
    await cache.remember('weather:one', 10_000, loader);
    expect(calls).toBe(1);
  });

  it('does not cache failures', async () => {
    const cache = new ProviderCache();
    await expect(cache.remember('bad', 10_000, async () => { throw new Error('upstream'); })).rejects.toThrow('upstream');
    await expect(cache.remember('bad', 10_000, async () => 'recovered')).resolves.toBe('recovered');
  });
});

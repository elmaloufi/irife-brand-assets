const entries = new Map();
const MAX_ENTRIES = 80;

function prune() {
  if (entries.size <= MAX_ENTRIES) return;
  const oldest = [...entries.entries()].sort((left, right) => left[1].lastAccess - right[1].lastAccess);
  for (const [key] of oldest.slice(0, entries.size - MAX_ENTRIES)) entries.delete(key);
}

export function cachedRequest(key, loader, ttlMs = 30_000) {
  const now = Date.now();
  const existing = entries.get(key);
  if (existing?.promise) {
    existing.lastAccess = now;
    return existing.promise;
  }
  if (existing && existing.expiresAt > now) {
    existing.lastAccess = now;
    return Promise.resolve(existing.value);
  }

  const promise = Promise.resolve().then(loader);
  entries.set(key, { expiresAt: 0, promise, lastAccess: now });
  return promise.then(
    (value) => {
      entries.set(key, { expiresAt: Date.now() + Math.max(0, ttlMs), value, lastAccess: Date.now() });
      prune();
      return value;
    },
    (error) => {
      if (entries.get(key)?.promise === promise) entries.delete(key);
      throw error;
    },
  );
}

export function clearRequestCache(prefix) {
  if (prefix === undefined) {
    entries.clear();
    return;
  }
  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) entries.delete(key);
  }
}

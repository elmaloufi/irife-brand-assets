import { Injectable } from '@nestjs/common';

interface CacheEntry { expiresAt: number; value?: unknown; pending?: Promise<unknown>; lastAccess: number; }

@Injectable()
export class ProviderCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly maxEntries = 500;

  async remember<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const current = this.entries.get(key);
    if (current?.pending) { current.lastAccess = now; return current.pending as Promise<T>; }
    if (current && current.expiresAt > now) { current.lastAccess = now; return current.value as T; }
    const pending = loader();
    this.entries.set(key, { expiresAt: 0, pending, lastAccess: now });
    try {
      const value = await pending;
      this.entries.set(key, { value, expiresAt: Date.now() + ttlMs, lastAccess: Date.now() });
      this.prune();
      return value;
    } catch (error) {
      if (this.entries.get(key)?.pending === pending) this.entries.delete(key);
      throw error;
    }
  }

  private prune(): void {
    if (this.entries.size <= this.maxEntries) return;
    const oldest = [...this.entries.entries()].sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    for (const [key] of oldest.slice(0, this.entries.size - this.maxEntries)) this.entries.delete(key);
  }
}

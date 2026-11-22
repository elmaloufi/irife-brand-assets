export declare function cachedRequest<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs?: number,
): Promise<T>;

export declare function clearRequestCache(prefix?: string): void;

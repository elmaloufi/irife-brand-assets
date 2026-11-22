export function restoreSessionWithFallback<T>(storedSession: T | null, restore: (session: T) => Promise<T | null>): Promise<T | null>;

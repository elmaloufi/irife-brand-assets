import { Injectable, TooManyRequestsException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';

interface WindowCounter {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const LIMITS: Record<string, number> = {
  '/identity/register': 5,
  '/identity/login': 10,
  '/identity/refresh': 30,
};

@Injectable()
export class IdentityRateLimitGuard implements CanActivate {
  private readonly counters = new Map<string, WindowCounter>();

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const route = request.route?.path ?? request.path;
    const limit = LIMITS[route] ?? 10;
    const key = `${request.ip ?? 'unknown'}:${request.method}:${route}`;
    const now = Date.now();
    let counter = this.counters.get(key);

    if (!counter || counter.resetAt <= now) {
      counter = { count: 0, resetAt: now + WINDOW_MS };
      this.counters.set(key, counter);
    }

    if (counter.count >= limit) {
      response.setHeader('Retry-After', String(Math.max(1, Math.ceil((counter.resetAt - now) / 1000))));
      throw new TooManyRequestsException({
        code: 'AUTH_RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again later.',
      });
    }

    counter.count += 1;

    if (this.counters.size > 10_000) {
      for (const [entryKey, entry] of this.counters) {
        if (entry.resetAt <= now) this.counters.delete(entryKey);
      }
    }

    return true;
  }
}

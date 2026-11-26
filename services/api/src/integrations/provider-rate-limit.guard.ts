import { HttpException, HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';

interface Policy { limit: number; windowMs: number; }
const POLICIES: Record<string, Policy> = {
  '/integrations/weather': { limit: 30, windowMs: 60_000 },
  '/integrations/geocoding': { limit: 10, windowMs: 60_000 },
  '/integrations/events': { limit: 10, windowMs: 60_000 },
  '/integrations/itri/chat': { limit: 12, windowMs: 60_000 },
};

@Injectable()
export class ProviderRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const path = request.path.replace(/^\/api\/v1/, '');
    const policy = POLICIES[path];
    if (!policy) return true;
    const now = Date.now();
    const address = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const key = `${address}:${path}`;
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + policy.windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (this.buckets.size > 2_000) {
      for (const [entryKey, value] of this.buckets) if (value.resetAt <= now) this.buckets.delete(entryKey);
    }
    response.setHeader('X-RateLimit-Limit', String(policy.limit));
    response.setHeader('X-RateLimit-Remaining', String(Math.max(0, policy.limit - bucket.count)));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > policy.limit) {
      response.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      throw new HttpException({ code: 'PROVIDER_RATE_LIMITED', message: 'Too many integration requests. Try again later.' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}

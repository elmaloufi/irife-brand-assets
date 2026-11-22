import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
interface RateBucket { count: number; resetAt: number; }
interface RatePolicy { limit: number; windowMs: number; }
const POLICIES: Record<string, RatePolicy> = {
  register: { limit: 3, windowMs: 60 * 60 * 1000 },
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  refresh: { limit: 20, windowMs: 60 * 1000 },
};
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateBucket>();
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const action = request.path.split('/').filter(Boolean).at(-1) ?? '';
    const policy = POLICIES[action];
    if (!policy) return true;
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const key = `${action}:${ip}`;
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + policy.windowMs };
      this.buckets.set(key, bucket);
    }
    if (this.buckets.size > 10_000) {
      for (const [bucketKey, value] of this.buckets) {
        if (value.resetAt <= now) this.buckets.delete(bucketKey);
      }
      if (this.buckets.size > 10_000) {
        const oldestKey = this.buckets.keys().next().value;
        if (oldestKey) this.buckets.delete(oldestKey);
      }
    }
    const remaining = Math.max(0, policy.limit - bucket.count - 1);
    response.setHeader('X-RateLimit-Limit', String(policy.limit));
    response.setHeader('X-RateLimit-Remaining', String(remaining));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count >= policy.limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      response.setHeader('Retry-After', String(retryAfter));
      throw new HttpException(
        { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    bucket.count += 1;
    return true;
  }
}

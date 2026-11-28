import { createHmac } from 'node:crypto';
import { HttpException, HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';

interface WindowPolicy {
  max: number;
  windowMs: number;
}

interface RateLimitRow {
  requestCount: number;
  windowStartedAt: Date;
}

const POLICIES: Record<string, WindowPolicy> = {
  '/identity/register': { max: 3, windowMs: 60 * 60 * 1000 },
  '/identity/login': { max: 5, windowMs: 15 * 60 * 1000 },
  '/identity/refresh': { max: 20, windowMs: 15 * 60 * 1000 },
  '/identity/password/forgot': { max: 3, windowMs: 60 * 60 * 1000 },
  '/identity/password/reset': { max: 5, windowMs: 15 * 60 * 1000 },
};

@Injectable()
export class IdentityRateLimitGuard implements CanActivate {
  private cleanupCounter = 0;

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const originalPath = (request.originalUrl.split('?')[0] ?? request.path).toLowerCase();
    const pathWithoutPrefix = originalPath.startsWith('/api/v1/')
      ? originalPath.slice('/api/v1'.length)
      : originalPath;
    // Express route matching is case-insensitive and accepts trailing slashes
    // by default. Normalize both so those variants cannot bypass auth limits.
    const route = pathWithoutPrefix.replace(/\/+$/, '') || '/';
    const policy = POLICIES[route];
    if (!policy) return true;

    const now = new Date();
    const windowStart = new Date(now.getTime() - policy.windowMs);
    const expiresAt = new Date(now.getTime() + policy.windowMs);
    const clientAddress = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const secret = process.env.DATABASE_URL ?? 'irife-local-development-only';
    const keyHash = createHmac('sha256', secret)
      .update(`${request.method}:${route}:${clientAddress}`)
      .digest('hex');

    const rows = await this.prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO "AuthRateLimitBucket" ("keyHash", "windowStartedAt", "requestCount", "expiresAt")
      VALUES (${keyHash}, ${now}, 1, ${expiresAt})
      ON CONFLICT ("keyHash") DO UPDATE SET
        "windowStartedAt" = CASE
          WHEN "AuthRateLimitBucket"."windowStartedAt" <= ${windowStart} THEN ${now}
          ELSE "AuthRateLimitBucket"."windowStartedAt"
        END,
        "requestCount" = CASE
          WHEN "AuthRateLimitBucket"."windowStartedAt" <= ${windowStart} THEN 1
          ELSE "AuthRateLimitBucket"."requestCount" + 1
        END,
        "expiresAt" = CASE
          WHEN "AuthRateLimitBucket"."windowStartedAt" <= ${windowStart} THEN ${expiresAt}
          ELSE "AuthRateLimitBucket"."expiresAt"
        END
      RETURNING "requestCount", "windowStartedAt"
    `;

    this.cleanupCounter += 1;
    if (this.cleanupCounter >= 500) {
      this.cleanupCounter = 0;
      void this.prisma.authRateLimitBucket.deleteMany({
        where: { expiresAt: { lt: now } },
      }).catch(() => undefined);
    }

    const bucket = rows[0];
    if (!bucket) {
      throw new HttpException('Authentication is temporarily unavailable.', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const resetAt = new Date(bucket.windowStartedAt).getTime() + policy.windowMs;
    if (bucket.requestCount > policy.max) {
      response.setHeader('Retry-After', String(Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000))));
      throw new HttpException({
        code: 'AUTH_RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again later.',
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}

import { describe, expect, it, jest } from '@jest/globals';
import { HttpException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { IdentityRateLimitGuard } from './identity-rate-limit.guard.js';

function createContext(path: string) {
  const response = { setHeader: jest.fn() };
  const request = {
    originalUrl: path,
    path,
    method: 'POST',
    ip: '192.0.2.10',
    socket: { remoteAddress: '192.0.2.10' },
  };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
  return { context, response };
}

describe('IdentityRateLimitGuard', () => {
  it('allows an authentication attempt while the shared database bucket is below its limit', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ requestCount: 1, windowStartedAt: new Date() }]),
      authRateLimitBucket: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    const guard = new IdentityRateLimitGuard(prisma as never);
    const { context } = createContext('/api/v1/identity/login');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('blocks attempts above the login threshold and supplies Retry-After', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ requestCount: 6, windowStartedAt: new Date() }]),
      authRateLimitBucket: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    const guard = new IdentityRateLimitGuard(prisma as never);
    const { context, response } = createContext('/api/v1/identity/login');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(HttpException);
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });

  it('does not rate-limit routes outside the authentication policy', async () => {
    const prisma = { $queryRaw: jest.fn() };
    const guard = new IdentityRateLimitGuard(prisma as never);
    const { context } = createContext('/api/v1/health');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });
});

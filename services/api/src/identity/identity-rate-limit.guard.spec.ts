import { describe, expect, it, jest } from '@jest/globals';
import { TooManyRequestsException, type ExecutionContext } from '@nestjs/common';
import { IdentityRateLimitGuard } from './identity-rate-limit.guard.js';

function contextFor(ip: string, path: string): ExecutionContext {
  const request = { ip, method: 'POST', path, route: { path } };
  const response = { setHeader: jest.fn() };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

describe('IdentityRateLimitGuard', () => {
  it('limits repeated login attempts per client address and route', () => {
    const guard = new IdentityRateLimitGuard();
    const context = contextFor('192.0.2.10', '/identity/login');

    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(guard.canActivate(context)).toBe(true);
    }

    expect(() => guard.canActivate(context)).toThrow(TooManyRequestsException);
  });

  it('keeps limits isolated between client addresses', () => {
    const guard = new IdentityRateLimitGuard();
    const firstClient = contextFor('192.0.2.11', '/identity/login');
    const secondClient = contextFor('192.0.2.12', '/identity/login');

    for (let attempt = 0; attempt < 10; attempt += 1) {
      guard.canActivate(firstClient);
    }

    expect(guard.canActivate(secondClient)).toBe(true);
  });

  it('applies a stricter limit to registration', () => {
    const guard = new IdentityRateLimitGuard();
    const context = contextFor('192.0.2.13', '/identity/register');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      guard.canActivate(context);
    }

    expect(() => guard.canActivate(context)).toThrow(TooManyRequestsException);
  });
});

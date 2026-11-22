import { describe, expect, it, jest } from '@jest/globals';
import { HttpException, type ExecutionContext } from '@nestjs/common';
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

function expectLimited(guard: IdentityRateLimitGuard, context: ExecutionContext): void {
  try {
    guard.canActivate(context);
    throw new Error('Expected the request to be rate limited.');
  } catch (error) {
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(429);
  }
}

describe('IdentityRateLimitGuard', () => {
  it('limits repeated login attempts per client address and route', () => {
    const guard = new IdentityRateLimitGuard();
    const context = contextFor('192.0.2.10', '/identity/login');
    for (let attempt = 0; attempt < 10; attempt += 1) expect(guard.canActivate(context)).toBe(true);
    expectLimited(guard, context);
  });

  it('keeps limits isolated between client addresses', () => {
    const guard = new IdentityRateLimitGuard();
    const firstClient = contextFor('192.0.2.11', '/identity/login');
    const secondClient = contextFor('192.0.2.12', '/identity/login');
    for (let attempt = 0; attempt < 10; attempt += 1) guard.canActivate(firstClient);
    expect(guard.canActivate(secondClient)).toBe(true);
  });

  it('normalizes the global API prefix before selecting a route limit', () => {
    const guard = new IdentityRateLimitGuard();
    const context = contextFor('192.0.2.14', '/api/v1/identity/register');
    for (let attempt = 0; attempt < 5; attempt += 1) guard.canActivate(context);
    expectLimited(guard, context);
  });

  it('applies a stricter limit to registration', () => {
    const guard = new IdentityRateLimitGuard();
    const context = contextFor('192.0.2.13', '/identity/register');
    for (let attempt = 0; attempt < 5; attempt += 1) guard.canActivate(context);
    expectLimited(guard, context);
  });
});

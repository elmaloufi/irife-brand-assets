import { describe, expect, it } from '@jest/globals';
import { HttpException } from '@nestjs/common';
import { AuthRateLimitGuard } from './auth-rate-limit.guard.js';
function context(path: string, ip = '192.0.2.1') {
  const headers: Record<string, string> = {};
  const request = { path, ip, socket: { remoteAddress: ip } };
  const response = { setHeader: (name: string, value: string) => { headers[name] = value; } };
  return { headers, value: { switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }) } as never };
}
describe('AuthRateLimitGuard', () => {
  it('limits login attempts by source address and returns retry metadata', () => {
    const guard = new AuthRateLimitGuard();
    for (let attempt = 0; attempt < 5; attempt += 1) expect(guard.canActivate(context('/api/v1/identity/login').value)).toBe(true);
    const blocked = context('/api/v1/identity/login');
    expect(() => guard.canActivate(blocked.value)).toThrow(HttpException);
    expect(blocked.headers['Retry-After']).toBeDefined();
    expect(blocked.headers['X-RateLimit-Limit']).toBe('5');
  });
  it('keeps source-address buckets separate and ignores unrelated routes', () => {
    const guard = new AuthRateLimitGuard();
    for (let attempt = 0; attempt < 5; attempt += 1) expect(guard.canActivate(context('/api/v1/identity/login').value)).toBe(true);
    expect(guard.canActivate(context('/api/v1/identity/login', '192.0.2.2').value)).toBe(true);
    expect(guard.canActivate(context('/api/v1/identity/me').value)).toBe(true);
  });
  it('uses a stricter hourly policy for registration', () => {
    const guard = new AuthRateLimitGuard();
    for (let attempt = 0; attempt < 3; attempt += 1) expect(guard.canActivate(context('/api/v1/identity/register').value)).toBe(true);
    expect(() => guard.canActivate(context('/api/v1/identity/register').value)).toThrow(HttpException);
  });
});

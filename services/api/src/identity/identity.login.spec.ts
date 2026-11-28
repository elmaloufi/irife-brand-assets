import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IdentityService } from './identity.service.js';
import { hashPassword } from './password-hasher.js';

describe('IdentityService login hardening', () => {
  it('uses a generic authentication failure for an unknown email', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({
        $queryRaw: jest.fn().mockResolvedValue([]),
        user: { findFirst: jest.fn() },
        session: { create: jest.fn() },
      })),
    };
    const service = new IdentityService(prisma as never);

    await expect(service.login({ email: 'missing@example.com', password: 'a-long-password-value' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('omits password hashes and account status from successful login responses', async () => {
    const passwordHash = await hashPassword('a-long-password-value');
    const user = {
      id: '4f5a3d15-b8d4-4f8c-a12a-1cce2a18f2b3',
      email: 'traveler@example.com',
      displayName: 'IRIFE Traveler',
      role: 'TRAVELER',
      status: 'ACTIVE',
      passwordHash,
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
      $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({
        $queryRaw: jest.fn().mockResolvedValue([]),
        user: { findFirst: jest.fn().mockResolvedValue({ id: user.id }) },
        session: { create: jest.fn().mockResolvedValue({}) },
      })),
    };
    const service = new IdentityService(prisma as never);

    const result = await service.login({ email: ' TRAVELER@example.com ', password: 'a-long-password-value' });

    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });
    expect(JSON.stringify(result)).not.toContain(passwordHash);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });


  it('does not create a session when the password changed after the login credential check', async () => {
    const passwordHash = await hashPassword('a-long-password-value');
    const user = {
      id: '4f5a3d15-b8d4-4f8c-a12a-1cce2a18f2b3',
      email: 'traveler@example.com',
      displayName: 'IRIFE Traveler',
      role: 'TRAVELER',
      status: 'ACTIVE',
      passwordHash,
    };
    const sessionCreate = jest.fn();
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
      $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({
        $queryRaw: jest.fn().mockResolvedValue([]),
        user: { findFirst: jest.fn().mockResolvedValue(null) },
        session: { create: sessionCreate },
      })),
    };
    const service = new IdentityService(prisma as never);

    await expect(service.login({ email: user.email, password: 'a-long-password-value' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionCreate).not.toHaveBeenCalled();
  });

  it('does not reveal duplicate email addresses during registration', async () => {
    const prisma = {
      user: { create: jest.fn().mockRejectedValue({ code: 'P2002' }) },
    };
    const service = new IdentityService(prisma as never);

    await expect(service.register({
      email: 'already-used@example.com',
      displayName: 'Traveler',
      password: 'a-long-password-value',
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});

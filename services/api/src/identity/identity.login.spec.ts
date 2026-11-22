import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IdentityService } from './identity.service.js';
import { hashPassword } from './password-hasher.js';

describe('IdentityService login hardening', () => {
  it('uses a generic authentication failure for an unknown email', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      session: { create: jest.fn() },
    };
    const service = new IdentityService(prisma as never);

    await expect(service.login({ email: 'missing@example.com', password: 'a-long-password-value' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.session.create).not.toHaveBeenCalled();
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
      session: { create: jest.fn().mockResolvedValue({}) },
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
    expect(prisma.session.create).toHaveBeenCalledTimes(1);
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

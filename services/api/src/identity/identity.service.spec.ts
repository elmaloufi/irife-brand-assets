import { describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentityService } from './identity.service.js';
import { hashPassword } from './password-hasher.js';

describe('IdentityService authentication', () => {
  it('uses the same generic authentication failure for an unknown email', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      session: { create: jest.fn() },
    } as unknown as PrismaService;
    const service = new IdentityService(prisma);

    await expect(service.login({ email: 'missing@example.com', password: 'a-long-password-value' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'missing@example.com' },
    }));
    expect(prisma.session.create).not.toHaveBeenCalled();
  });

  it('does not return password hashes or account status in a successful login response', async () => {
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
    } as unknown as PrismaService;
    const service = new IdentityService(prisma);

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
});

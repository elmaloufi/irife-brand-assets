import { describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IdentityService } from './identity.service.js';
import { hashPassword } from './password-hasher.js';
describe('IdentityService authentication', () => {
  it('returns a generic authentication error for an unknown email address', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) }, session: { create: jest.fn() } } as unknown as PrismaService;
    await expect(new IdentityService(prisma).login({ email: 'missing@example.com', password: 'valid-password-123' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });
  it('rejects inactive accounts even when the password is correct', async () => {
    const passwordHash = await hashPassword('valid-password-123');
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({
        id: 'user-1', email: 'paused@example.com', displayName: 'Traveler',
        role: 'TRAVELER', status: 'SUSPENDED', passwordHash,
      }) },
      session: { create: jest.fn() },
    } as unknown as PrismaService;
    await expect(new IdentityService(prisma).login({ email: 'paused@example.com', password: 'valid-password-123' })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });
});

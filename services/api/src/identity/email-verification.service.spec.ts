import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { EmailVerificationService } from './email-verification.service.js';
import { hashToken } from './token.util.js';

describe('EmailVerificationService', () => {
  it('stores only a token digest and sends the raw one-time token', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
      user: { findUnique: jest.fn().mockResolvedValue({ email: 'traveler@example.com', status: 'ACTIVE', emailVerifiedAt: null }) },
      identityActionToken: {
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'token-1', ...data })),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
      identityActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const email = { deliverEmailVerificationCode: jest.fn().mockResolvedValue(undefined) };
    const service = new EmailVerificationService(prisma as never, email as never);

    await expect(service.requestVerification('user-1')).resolves.toEqual({ accepted: true });
    const stored = tx.identityActionToken.create.mock.calls[0]?.[0] as { data: { tokenHash: string; type: string; expiresAt: Date } };
    const delivered = email.deliverEmailVerificationCode.mock.calls[0]?.[1] as string;
    expect(stored.data.tokenHash).toBe(hashToken(delivered));
    expect(stored.data.tokenHash).not.toBe(delivered);
    expect(stored.data.type).toBe('EMAIL_VERIFICATION');
    expect(stored.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('does not send another message during the resend cooldown', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
      user: { findUnique: jest.fn().mockResolvedValue({ email: 'traveler@example.com', status: 'ACTIVE', emailVerifiedAt: null }) },
      identityActionToken: {
        findFirst: jest.fn().mockResolvedValue({ id: 'recent-token' }),
        count: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };
    const prisma = { $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)) };
    const email = { deliverEmailVerificationCode: jest.fn() };
    await expect(new EmailVerificationService(prisma as never, email as never).requestVerification('user-1'))
      .resolves.toEqual({ accepted: true });
    expect(email.deliverEmailVerificationCode).not.toHaveBeenCalled();
    expect(tx.identityActionToken.create).not.toHaveBeenCalled();
  });

  it('consumes a verification token atomically and persists the verification timestamp', async () => {
    const verifiedAt = new Date();
    const action = {
      id: 'token-1', type: 'EMAIL_VERIFICATION', consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'user-1', status: 'ACTIVE', emailVerifiedAt: null },
    };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
      identityActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: { update: jest.fn().mockResolvedValue({ emailVerifiedAt: verifiedAt }) },
    };
    const prisma = {
      identityActionToken: {
        findUnique: jest.fn().mockResolvedValue(action),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const service = new EmailVerificationService(prisma as never, { deliverEmailVerificationCode: jest.fn() } as never);
    await expect(service.confirmVerification('valid-verification-token')).resolves.toEqual({
      verified: true, emailVerifiedAt: verifiedAt.toISOString(),
    });
    expect(tx.identityActionToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'token-1', type: 'EMAIL_VERIFICATION', consumedAt: null }),
    }));
    expect(tx.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user-1' }, data: { emailVerifiedAt: expect.any(Date) },
    }));
  });

  it('rejects password-reset tokens for email verification', async () => {
    const prisma = {
      identityActionToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'reset-1', type: 'PASSWORD_RESET', consumedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
          user: { id: 'user-1', status: 'ACTIVE', emailVerifiedAt: null },
        }),
      },
    };
    const service = new EmailVerificationService(prisma as never, { deliverEmailVerificationCode: jest.fn() } as never);
    await expect(service.confirmVerification('password-reset-token')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('consumes an undelivered verification token so it cannot be used', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
      user: { findUnique: jest.fn().mockResolvedValue({ email: 'traveler@example.com', status: 'ACTIVE', emailVerifiedAt: null }) },
      identityActionToken: {
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 'token-1' }),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
      identityActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const email = { deliverEmailVerificationCode: jest.fn().mockRejectedValue(new Error('provider unavailable')) };
    const service = new EmailVerificationService(prisma as never, email as never);
    await expect(service.requestVerification('user-1')).rejects.toThrow('provider unavailable');
    expect(prisma.identityActionToken.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'token-1', consumedAt: null },
    }));
  });
});

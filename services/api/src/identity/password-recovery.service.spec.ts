import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { PasswordRecoveryService } from './password-recovery.service.js';
import { hashToken } from './token.util.js';
import { hashPassword, verifyPassword } from './password-hasher.js';

describe('PasswordRecoveryService', () => {
  it('returns the same accepted response for an unknown email without sending mail', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const email = { deliverOneTimeRecoveryCode: jest.fn() };
    const service = new PasswordRecoveryService(prisma as never, email as never);
    await expect(service.requestReset('missing@example.com')).resolves.toEqual({ accepted: true });
    expect(email.deliverOneTimeRecoveryCode).not.toHaveBeenCalled();
  });

  it('serializes reset-token issuance and stores only a hash of the token', async () => {
    const user = { id: 'user-1', email: 'traveler@example.com', status: 'ACTIVE' };
    const tokenCreate = jest.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'token-1', ...data }));
    const tokenUpdate = jest.fn().mockResolvedValue({ count: 0 });
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      user: { findUnique: jest.fn().mockResolvedValue({ status: 'ACTIVE' }) },
      identityActionToken: { updateMany: tokenUpdate, create: tokenCreate },
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(user) },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const email = { deliverOneTimeRecoveryCode: jest.fn().mockResolvedValue(undefined) };
    const service = new PasswordRecoveryService(prisma as never, email as never);
    await expect(service.requestReset(' TRAVELER@example.com ')).resolves.toEqual({ accepted: true });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tokenUpdate).toHaveBeenCalledTimes(1);
    const stored = tokenCreate.mock.calls[0]?.[0] as { data: { tokenHash: string; type: string; expiresAt: Date } };
    const delivered = email.deliverOneTimeRecoveryCode.mock.calls[0]?.[1] as string;
    expect(stored.data.tokenHash).toBe(hashToken(delivered));
    expect(stored.data.tokenHash).not.toBe(delivered);
    expect(stored.data.type).toBe('PASSWORD_RESET');
    expect(stored.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('consumes an undelivered token while keeping the response non-enumerating', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      user: { findUnique: jest.fn().mockResolvedValue({ status: 'ACTIVE' }) },
      identityActionToken: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 'token-1' }),
      },
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1', email: 'traveler@example.com', status: 'ACTIVE' }) },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
      identityActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const email = { deliverOneTimeRecoveryCode: jest.fn().mockRejectedValue(new Error('provider unavailable')) };
    const service = new PasswordRecoveryService(prisma as never, email as never);
    await expect(service.requestReset('traveler@example.com')).resolves.toEqual({ accepted: true });
    expect(prisma.identityActionToken.updateMany).toHaveBeenCalledTimes(1);
  });

  it('rejects unknown, expired, or already consumed reset tokens', async () => {
    const prisma = { identityActionToken: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new PasswordRecoveryService(prisma as never, { deliverOneTimeRecoveryCode: jest.fn() } as never);
    await expect(service.completeReset('not-a-token', 'a-new-long-password'))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('locks the account, consumes the reset token, changes the password, and revokes every active session atomically', async () => {
    const oldHash = await hashPassword('the-current-long-password');
    const action = { id: 'action-1', type: 'PASSWORD_RESET', consumedAt: null, expiresAt: new Date(Date.now() + 60_000), user: { id: 'user-1', status: 'ACTIVE' } };
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      identityActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: {
        findUnique: jest.fn().mockResolvedValue({ status: 'ACTIVE' }),
        update: jest.fn().mockResolvedValue({}),
      },
      session: {
        findMany: jest.fn().mockResolvedValue([{ id: 'session-1' }, { id: 'session-2' }]),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      sessionCredential: { updateMany: jest.fn().mockResolvedValue({ count: 4 }) },
    };
    const prisma = {
      identityActionToken: { findUnique: jest.fn().mockResolvedValue(action) },
      $transaction: jest.fn(async (callback: (client: typeof transactionClient) => Promise<unknown>) => callback(transactionClient)),
    };
    const service = new PasswordRecoveryService(prisma as never, { deliverOneTimeRecoveryCode: jest.fn() } as never);
    await expect(service.completeReset('valid-reset-token', 'the-new-long-password')).resolves.toEqual({ reset: true });
    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    const updateCall = transactionClient.user.update.mock.calls[0]?.[0] as { data: { passwordHash: string } };
    expect(await verifyPassword('the-new-long-password', updateCall.data.passwordHash)).toBe(true);
    expect(updateCall.data.passwordHash).not.toBe(oldHash);
    expect(transactionClient.identityActionToken.updateMany).toHaveBeenCalledTimes(1);
    expect(transactionClient.session.updateMany).toHaveBeenCalledTimes(1);
    expect(transactionClient.sessionCredential.updateMany).toHaveBeenCalledTimes(1);
  });

  it('does not change the password when another reset flow already consumed the token', async () => {
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      identityActionToken: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      user: {
        findUnique: jest.fn().mockResolvedValue({ status: 'ACTIVE' }),
        update: jest.fn(),
      },
      session: { findMany: jest.fn(), updateMany: jest.fn() },
      sessionCredential: { updateMany: jest.fn() },
    };
    const prisma = {
      identityActionToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'action-1', type: 'PASSWORD_RESET', consumedAt: null,
          expiresAt: new Date(Date.now() + 60_000), user: { id: 'user-1', status: 'ACTIVE' },
        }),
      },
      $transaction: jest.fn(async (callback: (client: typeof transactionClient) => Promise<unknown>) => callback(transactionClient)),
    };
    const service = new PasswordRecoveryService(prisma as never, { deliverOneTimeRecoveryCode: jest.fn() } as never);
    await expect(service.completeReset('raced-reset-token', 'the-new-long-password'))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(transactionClient.user.update).not.toHaveBeenCalled();
  });
});

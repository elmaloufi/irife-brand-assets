import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { hashPassword } from './password-hasher.js';
import { IdentityService } from './identity.service.js';

describe('identity session management', () => {

  it('serializes password changes with session creation and revokes all active credentials', async () => {
    const passwordHash = await hashPassword('the-current-long-password');
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      user: {
        findUnique: jest.fn().mockResolvedValue({ passwordHash, status: 'ACTIVE' }),
        update: jest.fn().mockResolvedValue({}),
      },
      session: {
        findMany: jest.fn().mockResolvedValue([{ id: 'session-1' }, { id: 'session-2' }]),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      sessionCredential: { updateMany: jest.fn().mockResolvedValue({ count: 4 }) },
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ passwordHash, status: 'ACTIVE' }) },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const service = new IdentityService(prisma as never);

    await expect(service.changePassword('user-1', 'the-current-long-password', 'the-new-long-password'))
      .resolves.toBeUndefined();
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.user.update).toHaveBeenCalledTimes(1);
    expect(tx.session.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      select: { id: true },
    });
    expect(tx.session.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.sessionCredential.updateMany).toHaveBeenCalledTimes(1);
  });

  it('aborts a password change if another password update won the account lock first', async () => {
    const oldHash = await hashPassword('the-current-long-password');
    const newerHash = await hashPassword('a-different-new-password');
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      user: {
        findUnique: jest.fn().mockResolvedValue({ passwordHash: newerHash, status: 'ACTIVE' }),
        update: jest.fn(),
      },
      session: { findMany: jest.fn(), updateMany: jest.fn() },
      sessionCredential: { updateMany: jest.fn() },
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ passwordHash: oldHash, status: 'ACTIVE' }) },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    };
    const service = new IdentityService(prisma as never);

    await expect(service.changePassword('user-1', 'the-current-long-password', 'the-new-long-password'))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.session.updateMany).not.toHaveBeenCalled();
  });

  it('returns only active sessions for the authenticated account and marks the current session', async () => {
    const rows = [
      { id: 'session-current', createdAt: new Date('2026-11-21T10:00:00Z'), lastUsedAt: null },
      { id: 'session-other', createdAt: new Date('2026-11-20T10:00:00Z'), lastUsedAt: new Date('2026-11-21T11:00:00Z') },
    ];
    const prisma = {
      session: { findMany: jest.fn().mockResolvedValue(rows) },
    };
    const service = new IdentityService(prisma as never);

    await expect(service.listSessions('traveler-1', 'session-current')).resolves.toEqual([
      { ...rows[0], isCurrent: true },
      { ...rows[1], isCurrent: false },
    ]);
    expect(prisma.session.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'traveler-1', revokedAt: null },
    }));
  });

  it('does not revoke a session owned by another account', async () => {
    const prisma = {
      session: { findFirst: jest.fn().mockResolvedValue(null), updateMany: jest.fn() },
      sessionCredential: { updateMany: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new IdentityService(prisma as never);

    await expect(service.revokeSession('traveler-1', 'foreign-session')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.session.updateMany).not.toHaveBeenCalled();
    expect(prisma.sessionCredential.updateMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('revokes the selected owned session and all of its credentials together', async () => {
    const prisma = {
      session: {
        findFirst: jest.fn().mockResolvedValue({ id: 'owned-session' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      sessionCredential: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
      $transaction: jest.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
    };
    const service = new IdentityService(prisma as never);

    await expect(service.revokeSession('traveler-1', 'owned-session')).resolves.toBeUndefined();
    expect(prisma.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'owned-session', userId: 'traveler-1', revokedAt: null },
    }));
    expect(prisma.sessionCredential.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { sessionId: 'owned-session', revokedAt: null },
    }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

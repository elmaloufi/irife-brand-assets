import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { IdentityService } from './identity.service.js';

const encryptionKey = Buffer.alloc(32, 7).toString('base64');
const originalKey = process.env.REFRESH_TOKEN_ENCRYPTION_KEY;

function createHarness() {
  const now = new Date(Date.now() + 60_000);
  const credential: Record<string, unknown> = {
    id: 'credential-1',
    sessionId: 'session-1',
    type: 'REFRESH',
    expiresAt: now,
    consumedAt: null,
    revokedAt: null,
    rotationRequestId: null,
    rotationResponseCiphertext: null,
    rotationResponseExpiresAt: null,
    session: { id: 'session-1', revokedAt: null, user: { status: 'ACTIVE' } },
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([]),
    sessionCredential: {
      findUnique: jest.fn(async () => credential),
      updateMany: jest.fn(async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        if (args.where.id === 'credential-1' && credential.consumedAt) return { count: 0 };
        Object.assign(credential, args.data);
        return { count: 1 };
      }),
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    session: {
      update: jest.fn().mockResolvedValue({}),
    },
  };
  const prisma = {
    sessionCredential: { findUnique: jest.fn().mockResolvedValue({ id: 'credential-1', sessionId: 'session-1' }) },
    $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
  };
  return { service: new IdentityService(prisma as never), prisma, tx, credential };
}

describe('IdentityService refresh rotation idempotency', () => {
  afterEach(() => {
    if (originalKey === undefined) delete process.env.REFRESH_TOKEN_ENCRYPTION_KEY;
    else process.env.REFRESH_TOKEN_ENCRYPTION_KEY = originalKey;
  });

  it('returns the original token response when the same request is retried after a lost response', async () => {
    process.env.REFRESH_TOKEN_ENCRYPTION_KEY = encryptionKey;
    const { service, tx, credential } = createHarness();

    const first = await service.refresh('a'.repeat(48), 'request-id-00000001');
    expect(tx.$queryRaw).toHaveBeenNthCalledWith(1, expect.anything(), 'session-1');
    expect(tx.$queryRaw).toHaveBeenNthCalledWith(2, expect.anything(), 'credential-1');
    expect(tx.sessionCredential.createMany).toHaveBeenCalledTimes(1);
    expect(credential.rotationRequestId).toBe('request-id-00000001');
    expect(typeof credential.rotationResponseCiphertext).toBe('string');

    const retry = await service.refresh('a'.repeat(48), 'request-id-00000001');
    expect(retry).toEqual(first);
    expect(tx.sessionCredential.createMany).toHaveBeenCalledTimes(1);
    expect(tx.session.update).toHaveBeenCalledTimes(1);
  });

  it('revokes the session when a consumed refresh token is reused with a different request id', async () => {
    process.env.REFRESH_TOKEN_ENCRYPTION_KEY = encryptionKey;
    const { service, tx } = createHarness();

    await service.refresh('b'.repeat(48), 'request-id-00000001');
    await expect(service.refresh('b'.repeat(48), 'request-id-00000002'))
      .rejects.toBeInstanceOf(UnauthorizedException);

    expect(tx.session.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(tx.sessionCredential.updateMany).toHaveBeenCalledWith({
      where: { sessionId: 'session-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { IdentityService } from '../src/identity/identity.service.js';
import { hashPassword } from '../src/identity/password-hasher.js';
import { createOpaqueToken, hashToken } from '../src/identity/token.util.js';

jest.setTimeout(20_000);

const encryptionKey = Buffer.alloc(32, 11).toString('base64');
const previousEncryptionKey = process.env.REFRESH_TOKEN_ENCRYPTION_KEY;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});
const identity = new IdentityService(prisma as never);
const createdUserIds: string[] = [];

async function createRefreshFixture() {
  const passwordHash = await hashPassword('integration-current-password');
  const user = await prisma.user.create({
    data: {
      email: `refresh-test-${randomUUID()}@example.test`,
      passwordHash,
      displayName: 'Refresh Integration Test',
    },
  });
  createdUserIds.push(user.id);
  const session = await prisma.session.create({
    data: { userId: user.id, familyId: randomUUID() },
  });
  const refreshToken = createOpaqueToken();
  await prisma.sessionCredential.create({
    data: {
      sessionId: session.id,
      tokenHash: hashToken(refreshToken),
      type: 'REFRESH',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return { user, session, refreshToken };
}

describe('refresh-token rotation against PostgreSQL', () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for API integration tests');
    process.env.REFRESH_TOKEN_ENCRYPTION_KEY = encryptionKey;
    await prisma.$connect();
  });

  afterAll(async () => {
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.$disconnect();
    if (previousEncryptionKey === undefined) delete process.env.REFRESH_TOKEN_ENCRYPTION_KEY;
    else process.env.REFRESH_TOKEN_ENCRYPTION_KEY = previousEncryptionKey;
  });

  it('returns the same committed token pair for simultaneous retries with the same request id', async () => {
    const { session, refreshToken } = await createRefreshFixture();
    const requestId = `integration-${randomUUID()}`;

    const results = await Promise.all([
      identity.refresh(refreshToken, requestId),
      identity.refresh(refreshToken, requestId),
    ]);

    expect(results[0]).toEqual(results[1]);
    const credentials = await prisma.sessionCredential.findMany({ where: { sessionId: session.id } });
    expect(credentials.filter((item) => item.type === 'ACCESS' && item.revokedAt === null)).toHaveLength(1);
    expect(credentials.filter((item) => item.type === 'REFRESH' && item.revokedAt === null)).toHaveLength(1);
    const consumed = credentials.find((item) => item.type === 'REFRESH' && item.consumedAt !== null);
    expect(consumed?.rotationRequestId).toBe(requestId);
    expect(consumed?.rotationResponseCiphertext).toBeTruthy();
  });

  it('revokes the session when concurrent uses present different request ids', async () => {
    const { session, refreshToken } = await createRefreshFixture();

    const results = await Promise.allSettled([
      identity.refresh(refreshToken, `request-a-${randomUUID()}`),
      identity.refresh(refreshToken, `request-b-${randomUUID()}`),
    ]);

    expect(results.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.find((item) => item.status === 'rejected') as PromiseRejectedResult;
    expect(rejected.reason).toBeInstanceOf(UnauthorizedException);
    const persisted = await prisma.session.findUnique({
      where: { id: session.id },
      include: { credentials: true },
    });
    expect(persisted?.revokedAt).not.toBeNull();
    expect(persisted?.credentials.every((item) => item.revokedAt !== null)).toBe(true);
  });

  it('serializes refresh rotation with password change and leaves no live credentials', async () => {
    const { user, session, refreshToken } = await createRefreshFixture();

    const results = await Promise.allSettled([
      identity.refresh(refreshToken, `password-race-${randomUUID()}`),
      identity.changePassword(user.id, 'integration-current-password', 'integration-new-password'),
    ]);

    expect(results[1]?.status).toBe('fulfilled');
    if (results[0]?.status === 'rejected') {
      expect(results[0].reason).toBeInstanceOf(UnauthorizedException);
    }
    const persisted = await prisma.session.findUnique({
      where: { id: session.id },
      include: { credentials: true },
    });
    expect(persisted?.revokedAt).not.toBeNull();
    expect(persisted?.credentials.filter((item) => item.revokedAt === null)).toHaveLength(0);
  });
});

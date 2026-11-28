import {
  BadRequestException, Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword, verifyPassword } from './password-hasher.js';
import { createOpaqueToken, hashToken } from './token.util.js';
import type { AuthenticatedUser } from './identity.types.js';

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DUMMY_PASSWORD_HASH = hashPassword(randomBytes(32).toString('base64url'));
const REFRESH_RETRY_WINDOW_MS = 10 * 60 * 1000;

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

function getRefreshEncryptionKey(): Buffer {
  const configured = process.env.REFRESH_TOKEN_ENCRYPTION_KEY;
  if (!configured && process.env.NODE_ENV !== 'production') {
    // Development/test-only fallback. Production startup rejects a missing key.
    return createHash('sha256').update('IRIFE LOCAL ONLY refresh response encryption key').digest();
  }
  if (!configured) throw new Error('REFRESH_TOKEN_ENCRYPTION_KEY is required');
  const key = Buffer.from(configured, 'base64');
  if (key.length !== 32 || key.toString('base64') !== configured) {
    throw new Error('REFRESH_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
  }
  return key;
}

function encryptRefreshResponse(response: RefreshTokenResponse): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getRefreshEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(response), 'utf8'),
    cipher.final(),
  ]);
  return [iv, cipher.getAuthTag(), ciphertext]
    .map((part) => part.toString('base64url'))
    .join('.');
}

function decryptRefreshResponse(value: string): RefreshTokenResponse {
  const [ivText, tagText, ciphertextText, extra] = value.split('.');
  if (!ivText || !tagText || !ciphertextText || extra !== undefined) {
    throw new Error('Stored refresh rotation response is malformed');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getRefreshEncryptionKey(),
    Buffer.from(ivText, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  const parsed = JSON.parse(plaintext) as Partial<RefreshTokenResponse>;
  if (
    typeof parsed.accessToken !== 'string' ||
    typeof parsed.refreshToken !== 'string' ||
    parsed.tokenType !== 'Bearer' ||
    typeof parsed.expiresIn !== 'number'
  ) {
    throw new Error('Stored refresh rotation response is invalid');
  }
  return parsed as RefreshTokenResponse;
}

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: { email: string; displayName: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await hashPassword(input.password);
    let user;
    try {
      user = await this.prisma.user.create({
        data: { email, displayName: input.displayName.trim(), passwordHash },
        select: { id: true, email: true, displayName: true, role: true },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new BadRequestException({ code: 'ACCOUNT_CREATION_FAILED', message: 'An account could not be created with these details.' });
      }
      throw error;
    }
    return this.createSession(user, passwordHash);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
      select: { id: true, email: true, displayName: true, role: true, status: true, passwordHash: true },
    });
    // Perform the same expensive password derivation for unknown and suspended accounts
    // to reduce account-enumeration timing differences.
    const passwordMatches = user
      ? await verifyPassword(input.password, user.passwordHash)
      : await verifyPassword(input.password, await DUMMY_PASSWORD_HASH);

    if (!user || user.status !== 'ACTIVE' || !passwordMatches) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
    }
    const { status: _status, passwordHash: _passwordHash, ...safeUser } = user;
    return this.createSession(safeUser, user.passwordHash);
  }

  async updateProfile(userId: string, displayName: string) {
    const normalizedName = displayName.trim().replace(/\s+/g, ' ');
    if (normalizedName.length < 2 || normalizedName.length > 120) {
      throw new BadRequestException({ code: 'INVALID_DISPLAY_NAME', message: 'Display name must be between 2 and 120 characters.' });
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { displayName: normalizedName },
      select: { id: true, email: true, displayName: true, role: true },
    });
  }

  async validateAccessToken(token: string): Promise<AuthenticatedUser> {
    const credential = await this.prisma.sessionCredential.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { session: { include: { user: true } } },
    });
    const now = new Date();
    if (!credential || credential.type !== 'ACCESS' || credential.revokedAt ||
        credential.expiresAt <= now || credential.session.revokedAt ||
        credential.session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException({ code: 'INVALID_SESSION', message: 'The session is invalid or expired.' });
    }
    await this.prisma.session.update({
      where: { id: credential.sessionId },
      data: { lastUsedAt: now },
    });
    const user = credential.session.user;
    return { id: user.id, email: user.email, displayName: user.displayName, role: user.role, sessionId: credential.sessionId };
  }

  async refresh(refreshToken: string, requestId: string): Promise<RefreshTokenResponse> {
    const tokenHash = hashToken(refreshToken);
    const existing = await this.prisma.sessionCredential.findUnique({
      where: { tokenHash },
      select: { id: true },
    });
    if (!existing) {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'The refresh token is invalid or expired.' });
    }

    const now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      // Serialize all uses of one refresh credential. A retry with the same
      // request id receives the original encrypted response; a different id
      // remains a replay and revokes the session family.
      await tx.$queryRaw`SELECT "id" FROM "SessionCredential" WHERE "id" = ${existing.id}::uuid FOR UPDATE`;
      const credential = await tx.sessionCredential.findUnique({
        where: { id: existing.id },
        include: { session: { include: { user: true } } },
      });
      if (
        !credential ||
        credential.type !== 'REFRESH' ||
        credential.revokedAt ||
        credential.session.revokedAt ||
        credential.session.user.status !== 'ACTIVE'
      ) {
        return { kind: 'invalid' as const };
      }

      if (credential.consumedAt) {
        if (
          credential.rotationRequestId === requestId &&
          credential.rotationResponseCiphertext &&
          credential.rotationResponseExpiresAt &&
          credential.rotationResponseExpiresAt > now
        ) {
          return {
            kind: 'retry' as const,
            response: decryptRefreshResponse(credential.rotationResponseCiphertext),
          };
        }

        await tx.session.update({
          where: { id: credential.sessionId },
          data: { revokedAt: now },
        });
        await tx.sessionCredential.updateMany({
          where: { sessionId: credential.sessionId, revokedAt: null },
          data: { revokedAt: now },
        });
        return { kind: 'reuse' as const };
      }

      if (credential.expiresAt <= now) return { kind: 'invalid' as const };

      const response: RefreshTokenResponse = {
        accessToken: createOpaqueToken(),
        refreshToken: createOpaqueToken(),
        tokenType: 'Bearer',
        expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
      };
      const consumed = await tx.sessionCredential.updateMany({
        where: {
          id: credential.id,
          consumedAt: null,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          consumedAt: now,
          rotationRequestId: requestId,
          rotationResponseCiphertext: encryptRefreshResponse(response),
          rotationResponseExpiresAt: new Date(now.getTime() + REFRESH_RETRY_WINDOW_MS),
        },
      });
      if (consumed.count !== 1) {
        await tx.session.update({
          where: { id: credential.sessionId },
          data: { revokedAt: now },
        });
        await tx.sessionCredential.updateMany({
          where: { sessionId: credential.sessionId, revokedAt: null },
          data: { revokedAt: now },
        });
        return { kind: 'reuse' as const };
      }

      await tx.sessionCredential.createMany({
        data: [
          {
            sessionId: credential.sessionId,
            tokenHash: hashToken(response.accessToken),
            type: 'ACCESS',
            expiresAt: new Date(now.getTime() + ACCESS_TTL_MS),
          },
          {
            sessionId: credential.sessionId,
            tokenHash: hashToken(response.refreshToken),
            type: 'REFRESH',
            expiresAt: new Date(now.getTime() + REFRESH_TTL_MS),
          },
        ],
      });
      await tx.session.update({
        where: { id: credential.sessionId },
        data: { lastUsedAt: now },
      });
      return { kind: 'rotated' as const, response };
    });

    if (result.kind === 'invalid') {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'The refresh token is invalid or expired.' });
    }
    if (result.kind === 'reuse') {
      throw new UnauthorizedException({ code: 'REFRESH_TOKEN_REUSE', message: 'The session was revoked. Please sign in again.' });
    }
    return result.response;
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, lastUsedAt: true },
    });
    return sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      isCurrent: session.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
      select: { id: true },
    });
    if (!session) {
      throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'The requested session was not found.' });
    }
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.session.updateMany({ where: { id: session.id, userId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.sessionCredential.updateMany({ where: { sessionId: session.id, revokedAt: null }, data: { revokedAt: now } }),
    ]);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true, status: true },
    });
    if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException({ code: 'CURRENT_PASSWORD_INVALID', message: 'The current password is incorrect.' });
    }
    const passwordHash = await hashPassword(newPassword);
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      // Serialize password changes, reset flows, and session creation for this account.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId}::uuid FOR UPDATE`;
      const current = await tx.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true, status: true },
      });
      if (!current || current.status !== 'ACTIVE' || current.passwordHash !== user.passwordHash) {
        throw new UnauthorizedException({ code: 'CURRENT_PASSWORD_INVALID', message: 'The current password is incorrect.' });
      }
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      const sessions = await tx.session.findMany({
        where: { userId, revokedAt: null },
        select: { id: true },
      });
      const sessionIds = sessions.map((session) => session.id);
      if (sessionIds.length > 0) {
        await tx.session.updateMany({
          where: { id: { in: sessionIds }, revokedAt: null },
          data: { revokedAt: now },
        });
        await tx.sessionCredential.updateMany({
          where: { sessionId: { in: sessionIds }, revokedAt: null },
          data: { revokedAt: now },
        });
      }
    });
  }

  async logout(sessionId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.session.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.sessionCredential.updateMany({ where: { sessionId, revokedAt: null }, data: { revokedAt: now } }),
    ]);
  }

  private async createSession(
    user: { id: string; email: string; displayName: string; role: 'TRAVELER' | 'ADMIN' },
    expectedPasswordHash: string,
  ) {
    const now = new Date();
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const accessToken = createOpaqueToken();
    const refreshToken = createOpaqueToken();
    await this.prisma.$transaction(async (tx) => {
      // A login verified before a concurrent password change must not create a fresh session afterward.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id}::uuid FOR UPDATE`;
      const current = await tx.user.findFirst({
        where: { id: user.id, status: 'ACTIVE', passwordHash: expectedPasswordHash },
        select: { id: true },
      });
      if (!current) {
        throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
      }
      await tx.session.create({
        data: {
          id: sessionId, userId: user.id, familyId,
          credentials: { create: [
            { tokenHash: hashToken(accessToken), type: 'ACCESS', expiresAt: new Date(now.getTime() + ACCESS_TTL_MS) },
            { tokenHash: hashToken(refreshToken), type: 'REFRESH', expiresAt: new Date(now.getTime() + REFRESH_TTL_MS) },
          ] },
        },
      });
    });
    return {
      user, accessToken, refreshToken, tokenType: 'Bearer',
      expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
    };
  }
}

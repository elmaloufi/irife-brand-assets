import {
  BadRequestException, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword, verifyPassword } from './password-hasher.js';
import { createOpaqueToken, hashToken } from './token.util.js';
import type { AuthenticatedUser } from './identity.types.js';

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DUMMY_PASSWORD_HASH = hashPassword(randomBytes(32).toString('base64url'));

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
    return this.createSession(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
      select: { id: true, email: true, displayName: true, role: true, status: true, passwordHash: true },
    });
    const passwordMatches = user
      ? await verifyPassword(input.password, user.passwordHash)
      : await verifyPassword(input.password, await DUMMY_PASSWORD_HASH);
    if (!user || user.status !== 'ACTIVE' || !passwordMatches) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
    }
    const { status: _status, passwordHash: _passwordHash, ...safeUser } = user;
    return this.createSession(safeUser);
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

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const existing = await this.prisma.sessionCredential.findUnique({
      where: { tokenHash },
      include: { session: { include: { user: true } } },
    });
    const now = new Date();
    if (!existing || existing.type !== 'REFRESH' || existing.revokedAt ||
        existing.expiresAt <= now || existing.session.revokedAt ||
        existing.session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'The refresh token is invalid or expired.' });
    }

    const accessToken = createOpaqueToken();
    const nextRefreshToken = createOpaqueToken();
    const accessExpiresAt = new Date(now.getTime() + ACCESS_TTL_MS);
    const refreshExpiresAt = new Date(now.getTime() + REFRESH_TTL_MS);

    const rotated = await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.sessionCredential.updateMany({
        where: { id: existing.id, consumedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) {
        await tx.session.update({ where: { id: existing.sessionId }, data: { revokedAt: now } });
        await tx.sessionCredential.updateMany({
          where: { sessionId: existing.sessionId, revokedAt: null },
          data: { revokedAt: now },
        });
        return false;
      }
      await tx.sessionCredential.createMany({ data: [
        { sessionId: existing.sessionId, tokenHash: hashToken(accessToken), type: 'ACCESS', expiresAt: accessExpiresAt },
        { sessionId: existing.sessionId, tokenHash: hashToken(nextRefreshToken), type: 'REFRESH', expiresAt: refreshExpiresAt },
      ] });
      await tx.session.update({ where: { id: existing.sessionId }, data: { lastUsedAt: now } });
      return true;
    });

    if (!rotated) throw new UnauthorizedException({ code: 'REFRESH_TOKEN_REUSE', message: 'The session was revoked. Please sign in again.' });
    return {
      accessToken, refreshToken: nextRefreshToken, tokenType: 'Bearer',
      expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
    };
  }

  async logout(sessionId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.session.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.sessionCredential.updateMany({ where: { sessionId, revokedAt: null }, data: { revokedAt: now } }),
    ]);
  }

  private async createSession(user: { id: string; email: string; displayName: string; role: 'TRAVELER' | 'ADMIN' }) {
    const now = new Date();
    const sessionId = randomUUID();
    const familyId = randomUUID();
    const accessToken = createOpaqueToken();
    const refreshToken = createOpaqueToken();
    await this.prisma.session.create({
      data: {
        id: sessionId, userId: user.id, familyId,
        credentials: { create: [
          { tokenHash: hashToken(accessToken), type: 'ACCESS', expiresAt: new Date(now.getTime() + ACCESS_TTL_MS) },
          { tokenHash: hashToken(refreshToken), type: 'REFRESH', expiresAt: new Date(now.getTime() + REFRESH_TTL_MS) },
        ] },
      },
    });
    return {
      user, accessToken, refreshToken, tokenType: 'Bearer',
      expiresIn: Math.floor(ACCESS_TTL_MS / 1000),
    };
  }
}

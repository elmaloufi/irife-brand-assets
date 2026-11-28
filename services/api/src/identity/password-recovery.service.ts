import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailDeliveryService } from '../notifications/email-delivery.service.js';
import { hashPassword } from './password-hasher.js';
import { createOpaqueToken, hashToken } from './token.util.js';

const RESET_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);

  constructor(private readonly prisma: PrismaService, private readonly email: EmailDeliveryService) {}

  async requestReset(email: string): Promise<{ accepted: true }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, status: true },
    });
    // Always return the same response so callers cannot enumerate accounts.
    if (!user || user.status !== 'ACTIVE') return { accepted: true };

    const now = new Date();
    const token = createOpaqueToken();
    const action = await this.prisma.$transaction(async (tx) => {
      // Serialize reset-token issuance per account so concurrent requests cannot leave multiple live tokens.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id}::uuid FOR UPDATE`;
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { status: true },
      });
      if (!currentUser || currentUser.status !== 'ACTIVE') return null;
      await tx.identityActionToken.updateMany({
        where: { userId: user.id, type: 'PASSWORD_RESET', consumedAt: null },
        data: { consumedAt: now },
      });
      return tx.identityActionToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          type: 'PASSWORD_RESET',
          expiresAt: new Date(now.getTime() + RESET_TTL_MS),
        },
        select: { id: true },
      });
    });
    if (!action) return { accepted: true };

    try {
      await this.email.deliverOneTimeRecoveryCode(user.email, token);
    } catch {
      // Keep the public response indistinguishable for existing and unknown
      // accounts. Consume the undelivered token; users can safely retry.
      await this.prisma.identityActionToken.updateMany({
        where: { id: action.id, consumedAt: null },
        data: { consumedAt: new Date() },
      }).catch(() => undefined);
      this.logger.error('A password reset message could not be delivered.');
    }
    return { accepted: true };
  }

  async completeReset(token: string, newPassword: string): Promise<{ reset: true }> {
    const action = await this.prisma.identityActionToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, status: true } } },
    });
    const now = new Date();
    if (!action || action.type !== 'PASSWORD_RESET' || action.consumedAt || action.expiresAt <= now || action.user.status !== 'ACTIVE') {
      throw new BadRequestException({ code: 'INVALID_OR_EXPIRED_RESET_TOKEN', message: 'This password reset link is invalid or has expired. Request a new link.' });
    }

    const passwordHash = await hashPassword(newPassword);
    await this.prisma.$transaction(async (tx) => {
      // Lock the account row before consuming the token. This serializes competing reset tokens,
      // password changes, and session creation for the same user.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${action.user.id}::uuid FOR UPDATE`;
      const currentUser = await tx.user.findUnique({
        where: { id: action.user.id },
        select: { status: true },
      });
      if (!currentUser || currentUser.status !== 'ACTIVE') {
        throw new BadRequestException({ code: 'INVALID_OR_EXPIRED_RESET_TOKEN', message: 'This password reset link is invalid or has expired. Request a new link.' });
      }
      const consumed = await tx.identityActionToken.updateMany({
        where: { id: action.id, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) {
        throw new BadRequestException({ code: 'INVALID_OR_EXPIRED_RESET_TOKEN', message: 'This password reset link is invalid or has expired. Request a new link.' });
      }
      await tx.user.update({ where: { id: action.user.id }, data: { passwordHash } });
      const sessions = await tx.session.findMany({
        where: { userId: action.user.id, revokedAt: null },
        select: { id: true },
      });
      const sessionIds = sessions.map((session) => session.id);
      if (sessionIds.length > 0) {
        await tx.session.updateMany({ where: { id: { in: sessionIds }, revokedAt: null }, data: { revokedAt: now } });
        await tx.sessionCredential.updateMany({ where: { sessionId: { in: sessionIds }, revokedAt: null }, data: { revokedAt: now } });
      }
    });
    return { reset: true };
  }
}

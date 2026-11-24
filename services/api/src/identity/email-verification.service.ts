import { BadRequestException, Injectable, Logger, NotFoundException, TooManyRequestsException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailDeliveryService } from '../notifications/email-delivery.service.js';
import { createOpaqueToken, hashToken } from './token.util.js';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_DAILY_REQUESTS = 5;

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(private readonly prisma: PrismaService, private readonly email: EmailDeliveryService) {}

  async requestVerification(userId: string): Promise<{ accepted: true }> {
    const now = new Date();
    const issued = await this.prisma.$transaction(async (tx) => {
      // Serialize resend requests for this account so concurrent calls cannot
      // leave multiple live verification tokens.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "User" WHERE "id" = ${userId}::uuid FOR UPDATE`;
      if (locked.length !== 1) throw new NotFoundException({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found.' });

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { email: true, status: true, emailVerifiedAt: true },
      });
      if (!user || user.status !== 'ACTIVE') {
        throw new NotFoundException({ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found.' });
      }
      if (user.emailVerifiedAt) return null;

      const cooldownSince = new Date(now.getTime() - RESEND_COOLDOWN_MS);
      const recent = await tx.identityActionToken.findFirst({
        where: { userId, type: 'EMAIL_VERIFICATION', createdAt: { gt: cooldownSince } },
        select: { id: true },
      });
      if (recent) return null;

      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const dailyCount = await tx.identityActionToken.count({
        where: { userId, type: 'EMAIL_VERIFICATION', createdAt: { gt: dayAgo } },
      });
      if (dailyCount >= MAX_DAILY_REQUESTS) {
        throw new TooManyRequestsException({ code: 'VERIFICATION_RESEND_LIMIT', message: 'Too many verification emails. Please try again later.' });
      }

      const token = createOpaqueToken();
      await tx.identityActionToken.updateMany({
        where: { userId, type: 'EMAIL_VERIFICATION', consumedAt: null },
        data: { consumedAt: now },
      });
      const action = await tx.identityActionToken.create({
        data: {
          userId,
          tokenHash: hashToken(token),
          type: 'EMAIL_VERIFICATION',
          expiresAt: new Date(now.getTime() + VERIFICATION_TTL_MS),
        },
        select: { id: true },
      });
      return { id: action.id, email: user.email, token };
    });

    if (issued) {
      try {
        await this.email.deliverEmailVerificationCode(issued.email, issued.token);
      } catch (error) {
        await this.prisma.identityActionToken.updateMany({
          where: { id: issued.id, consumedAt: null },
          data: { consumedAt: new Date() },
        }).catch(() => undefined);
        this.logger.error('A verification message could not be delivered.');
        throw error;
      }
    }
    return { accepted: true };
  }

  async confirmVerification(token: string): Promise<{ verified: true; emailVerifiedAt: string }> {
    const action = await this.prisma.identityActionToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, status: true, emailVerifiedAt: true } } },
    });
    const now = new Date();
    if (!action || action.type !== 'EMAIL_VERIFICATION' || action.consumedAt ||
        action.expiresAt <= now || action.user.status !== 'ACTIVE') {
      throw new BadRequestException({ code: 'INVALID_OR_EXPIRED_VERIFICATION_TOKEN', message: 'This verification code is invalid or has expired. Request a new code.' });
    }
    if (action.user.emailVerifiedAt) {
      throw new BadRequestException({ code: 'EMAIL_ALREADY_VERIFIED', message: 'This email address has already been verified.' });
    }

    const verifiedAt = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "User" WHERE "id" = ${action.user.id}::uuid FOR UPDATE`;
      const consumed = await tx.identityActionToken.updateMany({
        where: {
          id: action.id, userId: action.user.id, type: 'EMAIL_VERIFICATION',
          consumedAt: null, expiresAt: { gt: now },
        },
        data: { consumedAt: now },
      });
      if (consumed.count !== 1) {
        throw new BadRequestException({ code: 'INVALID_OR_EXPIRED_VERIFICATION_TOKEN', message: 'This verification code is invalid or has expired. Request a new code.' });
      }
      const user = await tx.user.update({
        where: { id: action.user.id },
        data: { emailVerifiedAt: now },
        select: { emailVerifiedAt: true },
      });
      await tx.identityActionToken.updateMany({
        where: {
          userId: action.user.id, type: 'EMAIL_VERIFICATION',
          id: { not: action.id }, consumedAt: null,
        },
        data: { consumedAt: now },
      });
      return user.emailVerifiedAt;
    });

    if (!verifiedAt) {
      throw new BadRequestException({ code: 'VERIFICATION_FAILED', message: 'Email verification could not be completed. Please try again.' });
    }
    return { verified: true, emailVerifiedAt: verifiedAt.toISOString() };
  }
}

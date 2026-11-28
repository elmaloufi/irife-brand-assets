import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const CLEANUP_INTERVAL_MS = 60_000;

@Injectable()
export class RefreshRotationCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RefreshRotationCleanupService.name);
  private interval: NodeJS.Timeout | undefined;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    void this.cleanupExpiredResponses().catch(() => {
      this.logger.error('Expired refresh-rotation responses could not be cleared during startup.');
    });
    this.interval = setInterval(() => {
      void this.cleanupExpiredResponses().catch(() => {
        this.logger.error('Expired refresh-rotation responses could not be cleared.');
      });
    }, CLEANUP_INTERVAL_MS);
    this.interval.unref();
  }

  onModuleDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  async cleanupExpiredResponses(): Promise<void> {
    await this.prisma.sessionCredential.updateMany({
      where: {
        rotationResponseExpiresAt: { lte: new Date() },
        rotationResponseCiphertext: { not: null },
      },
      data: {
        rotationRequestId: null,
        rotationResponseCiphertext: null,
        rotationResponseExpiresAt: null,
      },
    });
  }
}

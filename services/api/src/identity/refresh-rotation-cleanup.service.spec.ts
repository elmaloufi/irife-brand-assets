import { describe, expect, it, jest } from '@jest/globals';
import { RefreshRotationCleanupService } from './refresh-rotation-cleanup.service.js';

describe('RefreshRotationCleanupService', () => {
  it('clears the encrypted response and correlation metadata after the retry window', async () => {
    const prisma = {
      sessionCredential: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const service = new RefreshRotationCleanupService(prisma as never);

    await service.cleanupExpiredResponses();

    expect(prisma.sessionCredential.updateMany).toHaveBeenCalledWith({
      where: {
        rotationResponseExpiresAt: { lte: expect.any(Date) },
        rotationResponseCiphertext: { not: null },
      },
      data: {
        rotationRequestId: null,
        rotationResponseCiphertext: null,
        rotationResponseExpiresAt: null,
      },
    });
  });
});

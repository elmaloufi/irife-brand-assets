import { describe, expect, it, jest } from '@jest/globals';
import { IdentityService } from './identity.service.js';
describe('identity profile management', () => {
  it('updates only the authenticated user display name and returns safe profile fields', async () => {
    const prisma = {
      user: { update: jest.fn().mockResolvedValue({ id: 'traveler-1', email: 'traveler@example.com', emailVerifiedAt: null, displayName: 'Yassine Traveler', role: 'TRAVELER' }) },
    };
    const service = new IdentityService(prisma as never);
    await expect(service.updateProfile('traveler-1', '  Yassine   Traveler  ')).resolves.toEqual({
      id: 'traveler-1', email: 'traveler@example.com', emailVerifiedAt: null, displayName: 'Yassine Traveler', role: 'TRAVELER',
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'traveler-1' },
      data: { displayName: 'Yassine Traveler' },
      select: { id: true, email: true, emailVerifiedAt: true, displayName: true, role: true },
    });
  });
});

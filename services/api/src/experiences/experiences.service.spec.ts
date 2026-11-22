import { describe, expect, it, jest } from '@jest/globals';
import { ExperiencesService } from './experiences.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
describe('ExperiencesService', () => {
  it('filters public experiences by published state, active provider and published destination', async () => {
    const prisma = { experience: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) } } as unknown as PrismaService;
    await new ExperiencesService(prisma).list(1, 20, '00000000-0000-4000-8000-000000000001');
    const where = { status: 'PUBLISHED', provider: { status: 'ACTIVE' }, destination: { isPublished: true }, destinationId: '00000000-0000-4000-8000-000000000001' };
    expect(prisma.experience.count).toHaveBeenCalledWith({ where });
    expect(prisma.experience.findMany).toHaveBeenCalledWith(expect.objectContaining({ where, skip: 0, take: 20 }));
  });
  it('normalizes Decimal prices to strings and returns ordered media', async () => {
    const prisma = { experience: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([{
        id: 'e1', slug: 'medina-walk', title: 'Medina walk', summary: null, currency: 'MAD',
        priceFrom: { toString: () => '250.00' }, durationMinutes: 120, maxGroupSize: 8,
        provider: { name: 'Local guide' }, destination: { id: 'd1', slug: 'fez', name: 'Fez' },
        media: [{ url: 'https://example.com/1.jpg', altText: null, position: 0 }],
      }]),
    } } as unknown as PrismaService;
    const result = await new ExperiencesService(prisma).list(1, 20);
    expect(result.data[0]?.priceFrom).toBe('250.00');
    expect(result.data[0]?.media[0]?.position).toBe(0);
  });
  it('does not return an unpublished experience', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue(null) } } as unknown as PrismaService;
    await expect(new ExperiencesService(prisma).findPublishedById('00000000-0000-4000-8000-000000000001')).resolves.toBeNull();
  });
});

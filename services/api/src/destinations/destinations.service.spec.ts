import { describe, expect, it, jest } from '@jest/globals';
import { DestinationsService } from './destinations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
describe('DestinationsService', () => {
  it('lists only published destinations with stable pagination', async () => {
    const prisma = { destination: {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([{ id: 'd1', slug: 'marrakesh', name: 'Marrakesh', countryCode: 'MA', region: 'Marrakesh-Safi', summary: null }]),
    } } as unknown as PrismaService;
    const result = await new DestinationsService(prisma).list(2, 10);
    expect(prisma.destination.count).toHaveBeenCalledWith({ where: { isPublished: true } });
    expect(prisma.destination.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { isPublished: true }, skip: 10, take: 10, orderBy: [{ name: 'asc' }, { id: 'asc' }],
    }));
    expect(result.pagination).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
    expect(result.data[0]?.slug).toBe('marrakesh');
  });
  it('does not return an unpublished destination', async () => {
    const prisma = { destination: { findFirst: jest.fn().mockResolvedValue(null) } } as unknown as PrismaService;
    await expect(new DestinationsService(prisma).findPublishedById('00000000-0000-4000-8000-000000000001')).resolves.toBeNull();
    expect(prisma.destination.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: '00000000-0000-4000-8000-000000000001', isPublished: true },
    }));
  });
});

import { describe, expect, it, jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { SavedExperiencesService } from './saved-experiences.service.js';

describe('saved experiences', () => {
  it('saves only a publicly available experience for the authenticated user', async () => {
    const savedRow = {
      id: 'saved-1', createdAt: new Date('2026-11-22T10:00:00.000Z'),
      experience: {
        id: 'experience-1', title: 'Old Medina walk', summary: null, currency: 'MAD', priceFrom: null,
        destination: { name: 'Fez' }, provider: { name: 'Local host' }, media: [],
      },
    };
    const prisma = {
      experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1' }) },
      savedExperience: { upsert: jest.fn().mockResolvedValue(savedRow) },
    };
    const result = await new SavedExperiencesService(prisma as never).save('traveler-1', 'experience-1');
    expect(prisma.savedExperience.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_experienceId: { userId: 'traveler-1', experienceId: 'experience-1' } },
      create: { userId: 'traveler-1', experienceId: 'experience-1' },
    }));
    expect(result.experience.title).toBe('Old Medina walk');
  });

  it('does not save unpublished experiences', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue(null) }, savedExperience: { upsert: jest.fn() } };
    await expect(new SavedExperiencesService(prisma as never).save('traveler-1', 'hidden'))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.savedExperience.upsert).not.toHaveBeenCalled();
  });

  it('scopes saved items to the authenticated user', async () => {
    const prisma = { savedExperience: { findMany: jest.fn().mockResolvedValue([]) } };
    await new SavedExperiencesService(prisma as never).listMine('traveler-2');
    expect(prisma.savedExperience.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: 'traveler-2' }),
    }));
  });

  it('removes only the selected user and experience pair', async () => {
    const prisma = { savedExperience: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) } };
    await expect(new SavedExperiencesService(prisma as never).remove('traveler-1', 'experience-1')).resolves.toBeUndefined();
    expect(prisma.savedExperience.deleteMany).toHaveBeenCalledWith({ where: { userId: 'traveler-1', experienceId: 'experience-1' } });
  });
});

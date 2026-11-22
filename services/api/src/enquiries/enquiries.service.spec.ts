import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service.js';

describe('traveler enquiries', () => {
  it('derives traveler and provider ownership from trusted server context', async () => {
    const created = {
      id: 'enquiry-1', createdAt: new Date('2026-11-22T10:00:00Z'), requestedStartAt: null,
      guestCount: 2, message: 'We would like to visit next week.', status: 'PENDING',
      experience: { id: 'experience-1', title: 'Old Medina walk', destination: { name: 'Fez' }, provider: { name: 'Local host' } },
    };
    const prisma = {
      experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1' }) },
      enquiry: { create: jest.fn().mockResolvedValue(created) },
    };
    const service = new EnquiriesService(prisma as never);
    await expect(service.create('traveler-1', {
      experienceId: 'experience-1', guestCount: 2, message: '  We would like to visit next week.  ',
    })).resolves.toEqual(created);
    expect(prisma.enquiry.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        travelerId: 'traveler-1', providerId: 'provider-1', experienceId: 'experience-1',
        guestCount: 2, message: 'We would like to visit next week.',
      }),
    }));
  });

  it('rejects experiences that are not publicly bookable', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue(null) }, enquiry: { create: jest.fn() } };
    const service = new EnquiriesService(prisma as never);
    await expect(service.create('traveler-1', {
      experienceId: 'unpublished-experience', guestCount: 1, message: 'Please share more information.',
    })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.enquiry.create).not.toHaveBeenCalled();
  });

  it('rejects requested dates in the past', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1' }) }, enquiry: { create: jest.fn() } };
    const service = new EnquiriesService(prisma as never);
    await expect(service.create('traveler-1', {
      experienceId: 'experience-1', requestedStartAt: '2020-01-01T10:00:00.000Z',
      guestCount: 1, message: 'Please share more information.',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.enquiry.create).not.toHaveBeenCalled();
  });

  it('scopes enquiry history to the authenticated traveler', async () => {
    const prisma = { enquiry: { count: jest.fn().mockResolvedValue(1), findMany: jest.fn().mockResolvedValue([]) } };
    const service = new EnquiriesService(prisma as never);
    await service.listMine('traveler-1', 2, 10);
    expect(prisma.enquiry.count).toHaveBeenCalledWith({ where: { travelerId: 'traveler-1' } });
    expect(prisma.enquiry.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { travelerId: 'traveler-1' }, skip: 10, take: 10,
    }));
  });
});

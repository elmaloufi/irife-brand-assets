import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service.js';

describe('EnquiriesService', () => {
  it('creates an enquiry using the authenticated traveler and published experience ownership', async () => {
    const createdAt = new Date('2026-12-01T10:00:00.000Z');
    const row = {
      id: 'enquiry-1',
      status: 'PENDING',
      requestedStartAt: new Date('2026-12-10T10:00:00.000Z'),
      guestCount: 2,
      message: 'We would like to visit.',
      createdAt,
      experience: { id: 'experience-1', title: 'Atlas walk', destination: { name: 'Marrakesh' } },
      provider: { name: 'Local guide' },
    };
    const prisma = {
      experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1' }) },
      enquiry: { create: jest.fn().mockResolvedValue(row) },
    };
    const service = new EnquiriesService(prisma as never);

    const result = await service.create('traveler-from-session', {
      experienceId: 'experience-1',
      requestedStartAt: '2026-12-10T10:00:00.000Z',
      guestCount: 2,
      message: '  We would like to visit.  ',
    });

    expect(prisma.experience.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: 'experience-1',
        status: 'PUBLISHED',
        provider: { status: 'ACTIVE' },
        destination: { isPublished: true },
      },
    }));
    expect(prisma.enquiry.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        travelerId: 'traveler-from-session',
        providerId: 'provider-1',
        experienceId: 'experience-1',
        message: 'We would like to visit.',
      }),
    }));
    expect(result.id).toBe('enquiry-1');
    expect(result.status).toBe('PENDING');
  });

  it('does not allow enquiries for unpublished or unavailable experiences', async () => {
    const prisma = {
      experience: { findFirst: jest.fn().mockResolvedValue(null) },
      enquiry: { create: jest.fn() },
    };
    const service = new EnquiriesService(prisma as never);

    await expect(service.create('traveler-1', {
      experienceId: 'hidden-experience',
      guestCount: 1,
      message: 'Please tell me more.',
    })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.enquiry.create).not.toHaveBeenCalled();
  });

  it('rejects requested dates in the past', async () => {
    const prisma = {
      experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1' }) },
      enquiry: { create: jest.fn() },
    };
    const service = new EnquiriesService(prisma as never);

    await expect(service.create('traveler-1', {
      experienceId: 'experience-1',
      requestedStartAt: '2020-01-01T10:00:00.000Z',
      guestCount: 1,
      message: 'Please tell me more.',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.enquiry.create).not.toHaveBeenCalled();
  });

  it('scopes the request list to the authenticated traveler', async () => {
    const prisma = { enquiry: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new EnquiriesService(prisma as never);

    await expect(service.listMine('traveler-2')).resolves.toEqual([]);
    expect(prisma.enquiry.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { travelerId: 'traveler-2' },
    }));
  });
});

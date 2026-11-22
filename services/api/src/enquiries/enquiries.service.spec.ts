import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EnquiriesService } from './enquiries.service.js';
describe('EnquiriesService', () => {
  it('creates an enquiry for the authenticated traveler and only a published experience', async () => {
    const now = new Date('2026-12-01T12:00:00.000Z');
    const prisma = {
      experience: { findFirst: jest.fn().mockResolvedValue({ id: 'exp-1', providerId: 'provider-1', maxGroupSize: 4 }) },
      enquiry: { create: jest.fn().mockResolvedValue({
        id: 'enq-1', status: 'PENDING', requestedStartAt: null, guestCount: 2, message: 'Please share available dates.',
        createdAt: now, updatedAt: now,
        experience: { id: 'exp-1', title: 'Old Medina Walk', currency: 'MAD', priceFrom: null, provider: { name: 'Local Host' }, destination: { name: 'Marrakesh' } },
      }) },
    } as unknown as PrismaService;
    const result = await new EnquiriesService(prisma).create('traveler-1', { experienceId: 'exp-1', guestCount: 2, message: ' Please share available dates. ' });
    expect(prisma.experience.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'exp-1', status: 'PUBLISHED', provider: { status: 'ACTIVE' }, destination: { isPublished: true } } }));
    expect(prisma.enquiry.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ travelerId: 'traveler-1', providerId: 'provider-1', message: 'Please share available dates.' }) }));
    expect(result.id).toBe('enq-1');
  });
  it('does not create enquiries for unpublished experiences', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue(null) }, enquiry: { create: jest.fn() } } as unknown as PrismaService;
    await expect(new EnquiriesService(prisma).create('traveler-1', { experienceId: 'exp-hidden', guestCount: 1, message: 'Please tell me more about this trip.' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.enquiry.create).not.toHaveBeenCalled();
  });
  it('rejects guest counts above the experience limit', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue({ id: 'exp-1', providerId: 'provider-1', maxGroupSize: 2 }), }, enquiry: { create: jest.fn() } } as unknown as PrismaService;
    await expect(new EnquiriesService(prisma).create('traveler-1', { experienceId: 'exp-1', guestCount: 3, message: 'Please share available dates.' })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.enquiry.create).not.toHaveBeenCalled();
  });
  it('scopes enquiry lists to the authenticated traveler', async () => {
    const prisma = { enquiry: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) } } as unknown as PrismaService;
    const result = await new EnquiriesService(prisma).listMine('traveler-2', 1, 20);
    expect(prisma.enquiry.count).toHaveBeenCalledWith({ where: { travelerId: 'traveler-2' } });
    expect(prisma.enquiry.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { travelerId: 'traveler-2' } }));
    expect(result.data).toEqual([]);
  });
});

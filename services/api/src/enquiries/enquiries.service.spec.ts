import { describe, expect, it, jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service.js';

const createdAt = new Date('2026-11-22T10:00:00.000Z');
const row = {
  id: 'enquiry-1', createdAt, requestedStartAt: null, guestCount: 2,
  message: 'We would like to visit next week.', status: 'PENDING',
  experience: { id: 'experience-1', title: 'Old Medina walk', destination: { name: 'Fez' }, provider: { name: 'Local host' } },
};
function transactionalPrisma(tx: Record<string, unknown>) {
  return {
    experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1', maxGroupSize: 4 }) },
    $transaction: jest.fn(async (callback: (value: never) => unknown) => callback(tx as never)),
    ...tx,
  };
}

describe('traveler enquiries', () => {
  it('derives traveler and provider ownership and records the initial status atomically', async () => {
    const tx = { enquiry: { create: jest.fn().mockResolvedValue(row) }, auditEvent: { create: jest.fn().mockResolvedValue({}) } };
    const prisma = transactionalPrisma(tx);
    const result = await new EnquiriesService(prisma as never).create('traveler-1', {
      experienceId: 'experience-1', guestCount: 2, message: '  We would like to visit next week.  ',
    });
    expect(result.message).toBe('We would like to visit next week.');
    expect(tx.enquiry.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        travelerId: 'traveler-1', providerId: 'provider-1', experienceId: 'experience-1',
        history: { create: { actorUserId: 'traveler-1', toStatus: 'PENDING' } },
      }),
    }));
    expect(tx.auditEvent.create).toHaveBeenCalledTimes(1);
  });

  it('rejects unpublished experiences', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue(null) } };
    await expect(new EnquiriesService(prisma as never).create('traveler-1', {
      experienceId: 'unpublished', guestCount: 1, message: 'Please share more information.',
    })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects guest counts above the experience maximum', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1', maxGroupSize: 2 }) } };
    await expect(new EnquiriesService(prisma as never).create('traveler-1', {
      experienceId: 'experience-1', guestCount: 3, message: 'Please share more information.',
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects requested dates in the past', async () => {
    const prisma = { experience: { findFirst: jest.fn().mockResolvedValue({ id: 'experience-1', providerId: 'provider-1', maxGroupSize: null }) } };
    await expect(new EnquiriesService(prisma as never).create('traveler-1', {
      experienceId: 'experience-1', requestedStartAt: '2020-01-01T10:00:00.000Z',
      guestCount: 1, message: 'Please share more information.',
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('scopes enquiry history to the authenticated traveler', async () => {
    const prisma = { enquiry: { count: jest.fn().mockResolvedValue(1), findMany: jest.fn().mockResolvedValue([]) } };
    await new EnquiriesService(prisma as never).listMine('traveler-1', 2, 10);
    expect(prisma.enquiry.count).toHaveBeenCalledWith({ where: { travelerId: 'traveler-1' } });
    expect(prisma.enquiry.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { travelerId: 'traveler-1' }, skip: 10, take: 10 }));
  });

  it('cancels only a pending enquiry owned by the requesting traveler and records the transition', async () => {
    const tx = {
      enquiry: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findFirst: jest.fn().mockResolvedValue({ ...row, status: 'CANCELLED' }),
      },
      enquiryStatusHistory: { create: jest.fn().mockResolvedValue({}) },
      auditEvent: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma = transactionalPrisma(tx);
    const result = await new EnquiriesService(prisma as never).cancelMine('traveler-1', 'enquiry-1');
    expect(result.status).toBe('CANCELLED');
    expect(tx.enquiry.updateMany).toHaveBeenCalledWith({ where: { id: 'enquiry-1', travelerId: 'traveler-1', status: 'PENDING' }, data: { status: 'CANCELLED' } });
    expect(tx.enquiryStatusHistory.create).toHaveBeenCalledWith({ data: { enquiryId: 'enquiry-1', actorUserId: 'traveler-1', fromStatus: 'PENDING', toStatus: 'CANCELLED' } });
    expect(tx.auditEvent.create).toHaveBeenCalledTimes(1);
  });

  it('does not cancel another traveler request or a request no longer pending', async () => {
    const tx = { enquiry: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) } };
    const prisma = transactionalPrisma(tx);
    await expect(new EnquiriesService(prisma as never).cancelMine('traveler-2', 'enquiry-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});

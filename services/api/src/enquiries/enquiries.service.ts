import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateEnquiryInput, EnquirySummary, PaginatedResponse } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
const enquirySelect = {
  id: true, status: true, requestedStartAt: true, guestCount: true, message: true, createdAt: true, updatedAt: true,
  experience: { select: { id: true, title: true, currency: true, priceFrom: true, provider: { select: { name: true } }, destination: { select: { name: true } } } },
};
function toSummary(row: {
  id: string; status: EnquirySummary['status']; requestedStartAt: Date | null; guestCount: number;
  message: string; createdAt: Date; updatedAt: Date;
  experience: { id: string; title: string; currency: string; priceFrom: { toString(): string } | null; provider: { name: string }; destination: { name: string } };
}): EnquirySummary {
  return {
    ...row, requestedStartAt: row.requestedStartAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
    experience: { ...row.experience, priceFrom: row.experience.priceFrom?.toString() ?? null },
  };
}
@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(travelerId: string, input: CreateEnquiryInput): Promise<EnquirySummary> {
    const experience = await this.prisma.experience.findFirst({
      where: { id: input.experienceId, status: 'PUBLISHED', provider: { status: 'ACTIVE' }, destination: { isPublished: true } },
      select: { id: true, providerId: true, maxGroupSize: true },
    });
    if (!experience) throw new NotFoundException('Published experience not found.');
    if (experience.maxGroupSize !== null && input.guestCount > experience.maxGroupSize) throw new BadRequestException('Guest count exceeds the experience group limit.');
    const requestedStartAt = input.requestedStartAt ? new Date(input.requestedStartAt) : null;
    if (requestedStartAt && requestedStartAt.getTime() <= Date.now()) throw new BadRequestException('Requested date must be in the future.');
    const created = await this.prisma.enquiry.create({
      data: {
        travelerId, providerId: experience.providerId, experienceId: experience.id,
        requestedStartAt, guestCount: input.guestCount, message: input.message.trim(),
        history: { create: { actorUserId: travelerId, toStatus: 'PENDING' } },
      },
      select: enquirySelect,
    });
    return toSummary(created);
  }
  async listMine(travelerId: string, page: number, limit: number): Promise<PaginatedResponse<EnquirySummary>> {
    const where = { travelerId };
    const [total, rows] = await Promise.all([
      this.prisma.enquiry.count({ where }),
      this.prisma.enquiry.findMany({ where, select: enquirySelect, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * limit, take: limit }),
    ]);
    return { data: rows.map(toSummary), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async cancelMine(travelerId: string, enquiryId: string): Promise<EnquirySummary> {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.enquiry.updateMany({ where: { id: enquiryId, travelerId, status: 'PENDING' }, data: { status: 'CANCELLED' } });
      if (changed.count !== 1) throw new NotFoundException('Pending enquiry not found.');
      await tx.enquiryStatusHistory.create({ data: { enquiryId, actorUserId: travelerId, fromStatus: 'PENDING', toStatus: 'CANCELLED' } });
      const row = await tx.enquiry.findFirst({ where: { id: enquiryId, travelerId }, select: enquirySelect });
      if (!row) throw new NotFoundException('Enquiry not found.');
      return toSummary(row);
    });
  }
}

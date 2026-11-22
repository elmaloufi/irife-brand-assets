import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateEnquiryInput, EnquirySummary } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

const enquirySelect = {
  id: true,
  status: true,
  requestedStartAt: true,
  guestCount: true,
  message: true,
  createdAt: true,
  experience: {
    select: {
      id: true,
      title: true,
      destination: { select: { name: true } },
    },
  },
  provider: { select: { name: true } },
};

function toSummary(row: {
  id: string;
  status: EnquirySummary['status'];
  requestedStartAt: Date | null;
  guestCount: number;
  message: string;
  createdAt: Date;
  experience: { id: string; title: string; destination: { name: string } };
  provider: { name: string };
}): EnquirySummary {
  return {
    ...row,
    requestedStartAt: row.requestedStartAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(travelerId: string, input: CreateEnquiryInput): Promise<EnquirySummary> {
    const experience = await this.prisma.experience.findFirst({
      where: {
        id: input.experienceId,
        status: 'PUBLISHED',
        provider: { status: 'ACTIVE' },
        destination: { isPublished: true },
      },
      select: { id: true, providerId: true },
    });
    if (!experience) {
      throw new NotFoundException({ code: 'EXPERIENCE_NOT_AVAILABLE', message: 'This experience is not available for requests.' });
    }

    const requestedStartAt = input.requestedStartAt ? new Date(input.requestedStartAt) : null;
    if (requestedStartAt && requestedStartAt.getTime() <= Date.now()) {
      throw new BadRequestException({ code: 'REQUEST_DATE_IN_PAST', message: 'Choose a future date for your experience request.' });
    }

    const created = await this.prisma.enquiry.create({
      data: {
        travelerId,
        providerId: experience.providerId,
        experienceId: experience.id,
        requestedStartAt,
        guestCount: input.guestCount,
        message: input.message.trim(),
        history: {
          create: {
            fromStatus: null,
            toStatus: 'PENDING',
            actorUserId: travelerId,
            note: 'Enquiry created',
          },
        },
      },
      select: enquirySelect,
    });
    return toSummary(created);
  }

  async listMine(travelerId: string): Promise<EnquirySummary[]> {
    const rows = await this.prisma.enquiry.findMany({
      where: { travelerId },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      select: enquirySelect,
    });
    return rows.map(toSummary);
  }
}

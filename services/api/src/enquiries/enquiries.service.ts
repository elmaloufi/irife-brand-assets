import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { EnquirySummary, PaginatedResponse } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

const enquirySelect = {
  id: true, createdAt: true, requestedStartAt: true, guestCount: true, message: true, status: true,
  experience: {
    select: {
      id: true, title: true,
      destination: { select: { name: true } },
      provider: { select: { name: true } },
    },
  },
};

type EnquiryRecord = Omit<EnquirySummary, 'createdAt' | 'requestedStartAt'> & {
  createdAt: Date;
  requestedStartAt: Date | null;
};

function toSummary(row: EnquiryRecord): EnquirySummary {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    requestedStartAt: row.requestedStartAt?.toISOString() ?? null,
  };
}

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    travelerId: string,
    input: { experienceId: string; requestedStartAt?: string; guestCount: number; message: string },
  ): Promise<EnquirySummary> {
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
      throw new NotFoundException({ code: 'EXPERIENCE_NOT_AVAILABLE', message: 'This experience is not currently available.' });
    }

    const requestedStartAt = input.requestedStartAt ? new Date(input.requestedStartAt) : null;
    if (requestedStartAt && requestedStartAt.getTime() <= Date.now()) {
      throw new BadRequestException({ code: 'REQUEST_DATE_IN_PAST', message: 'Choose a date and time in the future.' });
    }

    const row = await this.prisma.enquiry.create({
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
    return toSummary(row);
  }

  async listMine(travelerId: string, page: number, limit: number): Promise<PaginatedResponse<EnquirySummary>> {
    const where = { travelerId };
    const [total, rows] = await Promise.all([
      this.prisma.enquiry.count({ where }),
      this.prisma.enquiry.findMany({
        where, select: enquirySelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit, take: limit,
      }),
    ]);
    return {
      data: rows.map((row) => toSummary(row)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

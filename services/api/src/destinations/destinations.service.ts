import { Injectable } from '@nestjs/common';
import type { DestinationSummary, PaginatedResponse } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}
  async list(page: number, limit: number): Promise<PaginatedResponse<DestinationSummary>> {
    const where = { isPublished: true };
    const [total, rows] = await Promise.all([
      this.prisma.destination.count({ where }),
      this.prisma.destination.findMany({
        where, select: { id: true, slug: true, name: true, countryCode: true, region: true, summary: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: (page - 1) * limit, take: limit,
      }),
    ]);
    return { data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  findPublishedById(id: string): Promise<DestinationSummary | null> {
    return this.prisma.destination.findFirst({
      where: { id, isPublished: true },
      select: { id: true, slug: true, name: true, countryCode: true, region: true, summary: true },
    });
  }
}

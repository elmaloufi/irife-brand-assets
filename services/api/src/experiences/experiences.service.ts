import { Injectable } from '@nestjs/common';
import type { ExperienceCard, ExperienceDetail, PaginatedResponse } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
const publicWhere = { status: 'PUBLISHED' as const, provider: { status: 'ACTIVE' as const }, destination: { isPublished: true } };
const publicSelect = {
  id: true, slug: true, title: true, summary: true, currency: true, priceFrom: true,
  durationMinutes: true, maxGroupSize: true,
  provider: { select: { name: true } },
  destination: { select: { id: true, slug: true, name: true } },
  media: { select: { url: true, altText: true, position: true }, orderBy: { position: 'asc' as const } },
};
function toCard(row: {
  id: string; slug: string; title: string; summary: string | null; currency: string;
  priceFrom: { toString(): string } | null; durationMinutes: number | null; maxGroupSize: number | null;
  provider: { name: string }; destination: { id: string; slug: string; name: string };
  media: Array<{ url: string; altText: string | null; position: number }>;
}): ExperienceCard {
  return { ...row, priceFrom: row.priceFrom?.toString() ?? null };
}
@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}
  async list(page: number, limit: number, destinationId?: string): Promise<PaginatedResponse<ExperienceCard>> {
    const where = destinationId ? { ...publicWhere, destinationId } : publicWhere;
    const [total, rows] = await Promise.all([
      this.prisma.experience.count({ where }),
      this.prisma.experience.findMany({
        where, select: publicSelect, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit, take: limit,
      }),
    ]);
    return { data: rows.map(toCard), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async findPublishedById(id: string): Promise<ExperienceDetail | null> {
    const row = await this.prisma.experience.findFirst({ where: { ...publicWhere, id }, select: { ...publicSelect, description: true } });
    if (!row) return null;
    return { ...toCard(row), description: row.description };
  }
}

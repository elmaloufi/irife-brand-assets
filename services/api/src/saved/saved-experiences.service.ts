import { Injectable, NotFoundException } from '@nestjs/common';
import type { SavedExperienceSummary } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

const savedSelect = {
  id: true,
  createdAt: true,
  experience: {
    select: {
      id: true, title: true, summary: true, currency: true, priceFrom: true,
      destination: { select: { name: true } },
      provider: { select: { name: true } },
      media: { orderBy: { position: 'asc' as const }, select: { url: true, altText: true } },
    },
  },
};

type SavedRecord = {
  id: string;
  createdAt: Date;
  experience: {
    id: string; title: string; summary: string | null; currency: string;
    priceFrom: { toString(): string } | null;
    destination: { name: string }; provider: { name: string };
    media: Array<{ url: string; altText: string | null }>;
  };
};

function toSummary(row: SavedRecord): SavedExperienceSummary {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    experience: {
      ...row.experience,
      priceFrom: row.experience.priceFrom?.toString() ?? null,
    },
  };
}

@Injectable()
export class SavedExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string): Promise<SavedExperienceSummary[]> {
    const rows = await this.prisma.savedExperience.findMany({
      where: {
        userId,
        experience: { status: 'PUBLISHED', provider: { status: 'ACTIVE' }, destination: { isPublished: true } },
      },
      select: savedSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
    return rows.map((row) => toSummary(row));
  }

  async save(userId: string, experienceId: string): Promise<SavedExperienceSummary> {
    const experience = await this.prisma.experience.findFirst({
      where: {
        id: experienceId,
        status: 'PUBLISHED',
        provider: { status: 'ACTIVE' },
        destination: { isPublished: true },
      },
      select: { id: true },
    });
    if (!experience) {
      throw new NotFoundException({ code: 'EXPERIENCE_NOT_AVAILABLE', message: 'This experience is not currently available.' });
    }
    const row = await this.prisma.savedExperience.upsert({
      where: { userId_experienceId: { userId, experienceId: experience.id } },
      create: { userId, experienceId: experience.id },
      update: {},
      select: savedSelect,
    });
    return toSummary(row);
  }

  async remove(userId: string, experienceId: string): Promise<void> {
    await this.prisma.savedExperience.deleteMany({ where: { userId, experienceId } });
  }
}

import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@irife/contracts';
import { HEALTH_SERVICE } from '@irife/contracts';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<HealthResponse> {
    let database: HealthResponse['database'] = 'up';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      service: HEALTH_SERVICE,
      timestamp: new Date().toISOString(),
      database,
    };
  }
}

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { HealthService } from './health.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('HealthService', () => {
  const query = jest.fn<() => Promise<unknown>>();
  let service: HealthService;

  beforeEach(() => {
    query.mockReset();
    service = new HealthService({ $queryRaw: query } as unknown as PrismaService);
  });

  it('reports a healthy process and reachable database', async () => {
    query.mockResolvedValue([{ result: 1 }]);

    const result = await service.getStatus();

    expect(result).toMatchObject({
      status: 'ok',
      service: 'irife-api',
      database: 'up',
    });
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('reports degraded status without leaking database errors', async () => {
    query.mockRejectedValue(new Error('private database connection detail'));

    const result = await service.getStatus();

    expect(result).toMatchObject({
      status: 'degraded',
      service: 'irife-api',
      database: 'down',
    });
    expect(JSON.stringify(result)).not.toContain('private database connection detail');
  });
});

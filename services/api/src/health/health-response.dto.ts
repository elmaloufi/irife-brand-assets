import { ApiProperty } from '@nestjs/swagger';
import type { HealthResponse } from '@irife/contracts';

export class HealthResponseDto implements HealthResponse {
  @ApiProperty({ enum: ['ok', 'degraded'], example: 'ok' })
  status!: 'ok' | 'degraded';

  @ApiProperty({ enum: ['irife-api'], example: 'irife-api' })
  service!: 'irife-api';

  @ApiProperty({ format: 'date-time', example: '2026-11-22T12:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  database!: 'up' | 'down';
}

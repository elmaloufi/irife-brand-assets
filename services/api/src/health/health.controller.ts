import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthResponseDto } from './health-response.dto.js';
import { HealthService } from './health.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'The API and database are ready', type: HealthResponseDto })
  @ApiServiceUnavailableResponse({
    description: 'The API process is running but the database is unavailable',
    type: HealthResponseDto,
  })
  async getHealth(
    @Res({ passthrough: true }) response: Response,
  ): Promise<HealthResponseDto> {
    const result = await this.health.getStatus();
    if (result.status === 'degraded') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return result;
  }
}

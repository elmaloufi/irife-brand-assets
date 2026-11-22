import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service.js';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto.js';
@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinations: DestinationsService) {}
  @Get()
  @ApiOkResponse({ description: 'Published destinations with bounded pagination' })
  list(@Query() query: ListDestinationsQueryDto) { return this.destinations.list(query.page, query.limit); }
  @Get(':id')
  @ApiOkResponse({ description: 'A published destination' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const destination = await this.destinations.findPublishedById(id);
    if (!destination) throw new NotFoundException('Destination not found');
    return destination;
  }
}

import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ExperiencesService } from './experiences.service.js';
import { ListExperiencesQueryDto } from './dto/list-experiences-query.dto.js';
@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiences: ExperiencesService) {}
  @Get()
  @ApiOkResponse({ description: 'Published experiences with optional destination filter and bounded pagination' })
  list(@Query() query: ListExperiencesQueryDto) { return this.experiences.list(query.page, query.limit, query.destinationId); }
  @Get(':id')
  @ApiOkResponse({ description: 'A published experience with public provider and destination details' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const experience = await this.experiences.findPublishedById(id);
    if (!experience) throw new NotFoundException('Experience not found');
    return experience;
  }
}

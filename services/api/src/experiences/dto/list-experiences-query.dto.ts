import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export class ListExperiencesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by a published destination' })
  @IsOptional() @IsUUID() destinationId?: string;
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 10_000 }) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 }) limit = 20;
}

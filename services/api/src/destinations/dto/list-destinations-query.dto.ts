import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
export class ListDestinationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 10_000 }) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 }) limit = 20;
}

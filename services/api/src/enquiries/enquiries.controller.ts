import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { EnquirySummary, PaginatedResponse } from '@irife/contracts';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { AccessTokenGuard } from '../identity/access-token.guard.js';
import { CurrentUser } from '../identity/current-user.decorator.js';
import type { AuthenticatedUser } from '../identity/identity.types.js';
import { CreateEnquiryDto } from './dto/create-enquiry.dto.js';
import { EnquiriesService } from './enquiries.service.js';

@ApiTags('enquiries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller()
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Post('enquiries')
  @HttpCode(201)
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateEnquiryDto): Promise<EnquirySummary> {
    return this.enquiries.create(user.id, body);
  }

  @Get('me/enquiries')
  listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<EnquirySummary>> {
    return this.enquiries.listMine(user.id, query.page, query.limit);
  }
}

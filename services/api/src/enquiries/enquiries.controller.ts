import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../identity/access-token.guard.js';
import { CurrentUser } from '../identity/current-user.decorator.js';
import type { AuthenticatedUser } from '../identity/identity.types.js';
import { CreateEnquiryDto } from './dto/create-enquiry.dto.js';
import { ListMyEnquiriesQueryDto } from './dto/list-my-enquiries-query.dto.js';
import { EnquiriesService } from './enquiries.service.js';
@ApiTags('enquiries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateEnquiryDto) { return this.enquiries.create(user.id, body); }
}
@ApiTags('my enquiries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('me/enquiries')
export class MyEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListMyEnquiriesQueryDto) { return this.enquiries.listMine(user.id, query.page, query.limit); }
  @Post(':id/cancel') cancel(@CurrentUser() user: AuthenticatedUser, @Param('id', new ParseUUIDPipe()) id: string) { return this.enquiries.cancelMine(user.id, id); }
}

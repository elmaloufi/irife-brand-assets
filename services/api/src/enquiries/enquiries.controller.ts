import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../identity/access-token.guard.js';
import { CurrentUser } from '../identity/current-user.decorator.js';
import type { AuthenticatedUser } from '../identity/identity.types.js';
import { CreateEnquiryDto } from './dto/create-enquiry.dto.js';
import { EnquiriesService } from './enquiries.service.js';

@ApiTags('enquiries')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Create an enquiry for a published experience as the authenticated traveler' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateEnquiryDto) {
    return this.enquiries.create(user.id, body);
  }

  @Get('me')
  @ApiOkResponse({ description: 'List only enquiries owned by the authenticated traveler' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.enquiries.listMine(user.id);
  }
}

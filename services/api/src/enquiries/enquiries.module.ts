import { Module } from '@nestjs/common';
import { AccessTokenGuard } from '../identity/access-token.guard.js';
import { EnquiriesController } from './enquiries.controller.js';
import { EnquiriesService } from './enquiries.service.js';

@Module({
  controllers: [EnquiriesController],
  providers: [EnquiriesService, AccessTokenGuard],
})
export class EnquiriesModule {}

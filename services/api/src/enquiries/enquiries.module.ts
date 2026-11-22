import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { EnquiriesController, MyEnquiriesController } from './enquiries.controller.js';
import { EnquiriesService } from './enquiries.service.js';
@Module({ imports: [IdentityModule], controllers: [EnquiriesController, MyEnquiriesController], providers: [EnquiriesService] })
export class EnquiriesModule {}

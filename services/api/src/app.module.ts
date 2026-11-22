import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module.js';
import { HealthModule } from './health/health.module.js';
import { DestinationsModule } from './destinations/destinations.module.js';
import { ExperiencesModule } from './experiences/experiences.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { EnquiriesModule } from './enquiries/enquiries.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule, DestinationsModule, ExperiencesModule, IdentityModule, EnquiriesModule],
})
export class AppModule {}

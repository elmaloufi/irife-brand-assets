import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { IntegrationsController } from './integrations.controller.js';
import { IntegrationsService } from './integrations.service.js';
import { ProviderCache } from './provider-cache.js';
import { ProviderRateLimitGuard } from './provider-rate-limit.guard.js';

@Module({
  imports: [IdentityModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, ProviderCache, ProviderRateLimitGuard],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

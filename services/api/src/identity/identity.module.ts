import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { IdentityRateLimitGuard } from './identity-rate-limit.guard.js';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, AccessTokenGuard, IdentityRateLimitGuard],
  exports: [IdentityService, AccessTokenGuard],
})
export class IdentityModule {}

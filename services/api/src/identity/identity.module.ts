import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { AuthRateLimitGuard } from './auth-rate-limit.guard.js';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, AccessTokenGuard, AuthRateLimitGuard],
  exports: [IdentityService, AccessTokenGuard, AuthRateLimitGuard],
})
export class IdentityModule {}

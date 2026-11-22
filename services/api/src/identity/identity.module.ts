import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, AccessTokenGuard],
  exports: [IdentityService, AccessTokenGuard],
})
export class IdentityModule {}

import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { IdentityRateLimitGuard } from './identity-rate-limit.guard.js';
import { PasswordRecoveryService } from './password-recovery.service.js';
import { RefreshRotationCleanupService } from './refresh-rotation-cleanup.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [IdentityController],
  providers: [IdentityService, AccessTokenGuard, IdentityRateLimitGuard, PasswordRecoveryService, RefreshRotationCleanupService],
  exports: [IdentityService, AccessTokenGuard],
})
export class IdentityModule {}

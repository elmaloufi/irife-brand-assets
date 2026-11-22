import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from './access-token.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import { IdentityService } from './identity.service.js';
import { IdentityRateLimitGuard } from './identity-rate-limit.guard.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto.js';
import { CompletePasswordResetDto } from './dto/complete-password-reset.dto.js';
import { PasswordRecoveryService } from './password-recovery.service.js';
import type { AuthenticatedUser } from './identity.types.js';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService, private readonly passwordRecovery: PasswordRecoveryService) {}

  @Post('register')
  @UseGuards(IdentityRateLimitGuard)
  register(@Body() body: RegisterDto) {
    return this.identity.register(body);
  }

  @Post('login')
  @UseGuards(IdentityRateLimitGuard)
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.identity.login(body);
  }

  @Post('password/forgot')
  @UseGuards(IdentityRateLimitGuard)
  @HttpCode(202)
  requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    return this.passwordRecovery.requestReset(body.email);
  }

  @Post('password/reset')
  @UseGuards(IdentityRateLimitGuard)
  @HttpCode(200)
  completePasswordReset(@Body() body: CompletePasswordResetDto) {
    return this.passwordRecovery.completeReset(body.token, body.newPassword);
  }

  @Post('refresh')
  @UseGuards(IdentityRateLimitGuard)
  @HttpCode(200)
  refresh(@Body() body: RefreshDto) {
    return this.identity.refresh(body.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    const { sessionId: _sessionId, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateProfileDto) {
    return this.identity.updateProfile(user.id, body.displayName);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  sessions(@CurrentUser() user: AuthenticatedUser) {
    return this.identity.listSessions(user.id, user.sessionId);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
  ): Promise<void> {
    await this.identity.revokeSession(user.id, sessionId);
  }

  @Post('password')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangePasswordDto,
  ): Promise<void> {
    await this.identity.changePassword(user.id, body.currentPassword, body.newPassword);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.identity.logout(user.sessionId);
  }
}

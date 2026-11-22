import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from './access-token.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import { IdentityService } from './identity.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { AuthenticatedUser } from './identity.types.js';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.identity.register(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.identity.login(body);
  }

  @Post('refresh')
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

  @Post('logout')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.identity.logout(user.sessionId);
  }
}

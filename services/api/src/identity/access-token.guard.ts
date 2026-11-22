import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { IdentityService } from './identity.service.js';
import type { AuthenticatedUser } from './identity.types.js';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly identity: IdentityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
      throw new UnauthorizedException({ code: 'AUTHENTICATION_REQUIRED', message: 'Sign in to continue.' });
    }
    const token = authorization.replace(/^Bearer\s+/i, '');
    request.user = await this.identity.validateAccessToken(token);
    return true;
  }
}

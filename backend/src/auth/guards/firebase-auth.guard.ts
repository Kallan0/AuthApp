import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAuthService } from '../firebase-auth.service.js';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator.js';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly auth: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: CurrentUserData }>();
    const match = /^Bearer (\S+)$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Please sign in.');
    request.user = await this.auth.authenticate(match[1]);
    return true;
  }
}

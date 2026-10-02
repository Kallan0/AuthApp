import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserData } from '../common/decorators/current-user.decorator.js';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard.js';

@Controller('auth')
export class AuthController {
  @Get('me') @UseGuards(FirebaseAuthGuard) me(@CurrentUser() user: CurrentUserData) { return user; }
}

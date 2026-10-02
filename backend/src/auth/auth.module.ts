import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { FirebaseAuthService } from './firebase-auth.service.js';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [FirebaseAuthService, FirebaseAuthGuard],
  exports: [FirebaseAuthGuard, FirebaseAuthService],
})
export class AuthModule {}

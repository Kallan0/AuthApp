import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { UsersService } from '../users/users.service.js';
import type { CurrentUserData } from '../common/decorators/current-user.decorator.js';

@Injectable()
export class FirebaseAuthService {
  constructor(private readonly users: UsersService, config: ConfigService) {
    if (!getApps().length) {
      initializeApp({
        credential: applicationDefault(),
        projectId: config.getOrThrow<string>('firebaseProjectId'),
      });
    }
  }

  async authenticate(idToken: string): Promise<CurrentUserData> {
    let identity;
    try {
      identity = await getAuth().verifyIdToken(idToken, true);
    } catch {
      throw new UnauthorizedException('Please sign in again.');
    }
    const email = identity.email?.trim().toLowerCase();
    if (!email) throw new UnauthorizedException('An email address is required for this account.');

    let user = await this.users.findByFirebaseUid(identity.uid);
    if (!user) {
      // Never claim an existing Mongo account by email alone.
      if (await this.users.findByEmail(email)) {
        throw new ConflictException('This account needs help before you can sign in. Please contact support.');
      }
      const firebaseUser = await getAuth().getUser(identity.uid);
      const name = (firebaseUser.displayName || identity.name || email.split('@')[0]).trim().slice(0, 80);
      try {
        user = await this.users.createFirebaseUser(name, email, identity.uid);
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
          throw new ConflictException('This account is already in use. Please contact support.');
        }
        throw error;
      }
    }
    return { id: user._id.toString(), name: user.name, email: user.email };
  }
}

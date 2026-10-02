import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { FirebaseAuthService } from '../src/auth/firebase-auth.service.js';
import type { UsersService } from '../src/users/users.service.js';

const verifyIdToken = vi.hoisted(() => vi.fn());
const getUser = vi.hoisted(() => vi.fn());
vi.mock('firebase-admin/app', () => ({ getApps: () => [{}], applicationDefault: vi.fn(), initializeApp: vi.fn() }));
vi.mock('firebase-admin/auth', () => ({ getAuth: () => ({ verifyIdToken, getUser }) }));

describe('Firebase account ownership', () => {
  beforeEach(() => { verifyIdToken.mockReset(); getUser.mockReset(); });

  it('keeps a migrated user on the original MongoDB ID', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'firebase-uid', email: 'person@example.com' });
    const findByFirebaseUid = vi.fn().mockResolvedValue({
      _id: { toString: () => 'original-mongo-id' }, name: 'Person', email: 'person@example.com',
    });
    const users = { findByFirebaseUid, findByEmail: vi.fn(), createFirebaseUser: vi.fn() };
    const service = new FirebaseAuthService(users as unknown as UsersService, {} as ConfigService);
    await expect(service.authenticate('valid-token')).resolves.toEqual({
      id: 'original-mongo-id', name: 'Person', email: 'person@example.com',
    });
    expect(users.findByEmail).not.toHaveBeenCalled();
    expect(users.createFirebaseUser).not.toHaveBeenCalled();
  });

  it('creates a MongoDB user for a new Firebase account', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'new-uid', email: 'new@example.com' });
    getUser.mockResolvedValue({ displayName: 'New User' });
    const createFirebaseUser = vi.fn().mockResolvedValue({
      _id: { toString: () => 'new-mongo-id' }, name: 'New User', email: 'new@example.com',
    });
    const users = {
      findByFirebaseUid: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn().mockResolvedValue(null),
      createFirebaseUser,
    };
    const service = new FirebaseAuthService(users as unknown as UsersService, {} as ConfigService);
    await expect(service.authenticate('valid-token')).resolves.toEqual({
      id: 'new-mongo-id', name: 'New User', email: 'new@example.com',
    });
    expect(createFirebaseUser).toHaveBeenCalledWith('New User', 'new@example.com', 'new-uid');
  });
  it('rejects an unlinked Firebase identity with a legacy email', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'new-uid', email: 'person@example.com' });
    const users = {
      findByFirebaseUid: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn().mockResolvedValue({ _id: 'original-mongo-id' }),
      createFirebaseUser: vi.fn(),
    };
    const service = new FirebaseAuthService(users as unknown as UsersService, {} as ConfigService);
    await expect(service.authenticate('valid-token')).rejects.toBeInstanceOf(ConflictException);
    expect(users.createFirebaseUser).not.toHaveBeenCalled();
  });

  it('rejects an invalid token before looking up a user', async () => {
    verifyIdToken.mockImplementationOnce(() => { throw new Error('invalid token'); });
    const users = { findByFirebaseUid: vi.fn() };
    const service = new FirebaseAuthService(users as unknown as UsersService, {} as ConfigService);
    await expect(service.authenticate('invalid-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.findByFirebaseUid).not.toHaveBeenCalled();
  });
});
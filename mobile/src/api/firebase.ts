import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import type { Auth, Persistence } from 'firebase/auth';

let auth: Auth | undefined;

export function isFirebaseConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY
    && process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
    && process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
    && process.env.EXPO_PUBLIC_FIREBASE_APP_ID);
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error('Sign-in is not configured yet. Please contact support.');
  }
  const app = getApps().length ? getApp() : initializeApp({ apiKey, authDomain, projectId, appId });
  try {
    const factory = (FirebaseAuth as typeof FirebaseAuth & { getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence }).getReactNativePersistence;
    if (!factory) throw new Error('Persistent sign-in is unavailable in this build.');
    auth = FirebaseAuth.initializeAuth(app, { persistence: factory(AsyncStorage) });
  } catch (error) {
    if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'auth/already-initialized') throw error;
    auth = FirebaseAuth.getAuth(app);
  }
  return auth;
}


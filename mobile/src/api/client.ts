import axios from 'axios';
import { API_BASE_URL, PREVIEW_MODE } from '../constants/config';
import { getFirebaseAuth } from './firebase';
import type { ApiFailure } from '../types/api';

export const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
client.interceptors.request.use(async config => {
  if (!PREVIEW_MODE) {
    const user = getFirebaseAuth().currentUser;
    if (user) config.headers.Authorization = 'Bearer ' + await user.getIdToken();
  }
  return config;
});

const firebaseMessages: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered. Please sign in.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/user-disabled': 'This account is disabled.',
  'auth/weak-password': 'Please choose a stronger password.',
  'auth/network-request-failed': 'Cannot reach sign-in right now. Check your internet connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/account-exists-with-different-credential': 'Sign in with your email and password, then connect Google in Profile.',
};
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiFailure>(error)) {
    if (!error.response) return 'Cannot reach your workspace right now. Check your connection and try again.';
    return error.response.data?.message || 'Something went wrong. Please try again.';
  }
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    const code = error.code;
    if (code in firebaseMessages) return firebaseMessages[code];
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
};


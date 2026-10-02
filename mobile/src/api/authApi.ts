import axios from 'axios';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signOut, updateProfile, linkWithCredential } from 'firebase/auth';
import { client, getErrorMessage } from './client';
import { getFirebaseAuth } from './firebase';
import { previewApi } from './previewApi';
import { PREVIEW_MODE } from '../constants/config';
import type { ApiSuccess } from '../types/api';
import type { User } from '../types/auth';

export const authApi = {
  async register(name: string, email: string, password: string): Promise<User> {
    if (PREVIEW_MODE) return (await previewApi.register(name, email)).user;
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(credential.user, { displayName: name });
      return await this.profileOrSignOut();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) throw error;
      throw new Error('Your account was created, but setup could not finish. ' + getErrorMessage(error) + ' Sign in with the same email and password to retry.');
    }
  },
  async login(email: string, password: string): Promise<User> {
    if (PREVIEW_MODE) return (await previewApi.login(email)).user;
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return this.profileOrSignOut();
  },
  async google(): Promise<User | null> {
    if (PREVIEW_MODE) return null;
    const selected = await this.googleCredential();
    if (!selected) return null;
    await signInWithCredential(getFirebaseAuth(), selected.credential);
    return this.profileOrSignOut();
  },
  async linkGoogle(): Promise<boolean> {
    const current = getFirebaseAuth().currentUser;
    if (!current) throw new Error('Please sign in first.');
    const selected = await this.googleCredential();
    if (!selected) return false;
    if (selected.email.toLowerCase() !== current.email?.toLowerCase()) {
      throw new Error('Choose the Google account with the same email address.');
    }
    await linkWithCredential(current, selected.credential);
    return true;
  },
  async googleCredential(): Promise<{ credential: ReturnType<typeof GoogleAuthProvider.credential>; email: string } | null> {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) throw new Error('Google sign-in is unavailable right now. Please try again later.');
    // Loaded only on a development build; Expo Go does not have this native module.
    const { GoogleSignin } = require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
    GoogleSignin.configure({ webClientId });
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type !== 'success') return null;
    const idToken = response.data.idToken;
    if (!idToken) throw new Error('Google sign-in could not finish. Please try again.');
    return { credential: GoogleAuthProvider.credential(idToken), email: response.data.user.email };
  },
  async profileOrSignOut(): Promise<User> {
    try { return await this.me(); }
    catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 409)) {
        await signOut(getFirebaseAuth()).catch(() => {});
      }
      throw error;
    }
  },
  async me(): Promise<User> {
    if (PREVIEW_MODE) return previewApi.me();
    // A free hosted API may need about a minute to wake after being idle.
    const response = await client.get<ApiSuccess<User>>('/auth/me', { timeout: 90_000 });
    return response.data.data;
  },
  async logout(): Promise<void> {
    if (!PREVIEW_MODE) await signOut(getFirebaseAuth());
  },
};


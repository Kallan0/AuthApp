import axios from 'axios';
import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { getFirebaseAuth, isFirebaseConfigured } from '../api/firebase';
import { PREVIEW_MODE } from '../constants/config';
import { getErrorMessage } from '../api/client';
import { useTaskStore } from './taskStore';
import type { User } from '../types/auth';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  google: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
  const accept = (user: User) => set({ user, isAuthenticated: true, sessionError: null });
  return {
    user: null, isLoading: true, isAuthenticated: false, sessionError: null,
    login: async (email, password) => accept(await authApi.login(email, password)),
    register: async (name, email, password) => accept(await authApi.register(name, email, password)),
    google: async () => {
      const user = await authApi.google();
      if (user) accept(user);
    },
    logout: async () => {
      await authApi.logout();
      useTaskStore.getState().clear();
      set({ user: null, isAuthenticated: false, sessionError: null });
    },
    restoreSession: async () => {
      set({ isLoading: true, sessionError: null });
      if (PREVIEW_MODE || !isFirebaseConfigured()) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      try {
        const auth = getFirebaseAuth();
        await auth.authStateReady();
        if (!auth.currentUser) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          accept(await authApi.me());
        } catch (error) {
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 409)) {
            await authApi.logout();
            set({ user: null, isAuthenticated: false });
          } else {
            set({ sessionError: getErrorMessage(error) });
          }
        }
      } catch (error) {
        set({ sessionError: getErrorMessage(error) });
      } finally {
        set({ isLoading: false });
      }
    },
  };
});

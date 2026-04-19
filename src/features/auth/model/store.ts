import type { User } from '@/entities/user';
import type { AccessToken } from '@/entities/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth state interface
 */
export interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Current access token */
  accessToken: AccessToken | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Login action - set user and token */
  login: (user: User, token: AccessToken) => void;
  /** Logout action - clear all auth data */
  logout: () => void;
  /** Update user data */
  setUser: (user: User) => void;
}

/**
 * Auth store with persistence
 * Only persist user data (not token for security, use localStorage directly in client)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Note: accessToken is NOT persisted in zustand store,
        // we use localStorage directly for token management
      }),
    },
  ),
);

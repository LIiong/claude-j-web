import { clearTokens, setTokens } from '@/shared/api/client';
import type { TokenDataDTO } from '@/shared/api/dto/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 登录成功后保存的会话信息（纯 JSON，可安全序列化） */
export interface SessionUser {
  readonly userId: string;
  readonly username: string;
  readonly email: string | null;
  readonly phone: string | null;
}

export interface AuthState {
  session: SessionUser | null;
  isAuthenticated: boolean;
  login: (data: TokenDataDTO) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,

      login: (data) => {
        setTokens(data.accessToken, data.refreshToken);
        set({
          session: {
            userId: data.userId,
            username: data.username,
            email: data.email,
            phone: data.phone,
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearTokens();
        set({ session: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' },
  ),
);

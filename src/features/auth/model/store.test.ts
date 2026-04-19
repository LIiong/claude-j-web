import type { TokenDataDTO } from '@/shared/api/dto/auth';
import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import type { AuthState, SessionUser } from './store';

const mockTokenData: TokenDataDTO = {
  accessToken: 'access-jwt',
  refreshToken: 'refresh-jwt',
  expiresIn: 3600,
  userId: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  phone: null,
};

const createTestStore = () =>
  create<AuthState>((set) => ({
    session: null,
    isAuthenticated: false,
    login: (data) =>
      set({
        session: {
          userId: data.userId,
          username: data.username,
          email: data.email,
          phone: data.phone,
        },
        isAuthenticated: true,
      }),
    logout: () => set({ session: null, isAuthenticated: false }),
  }));

describe('AuthStore', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
  });

  it('should_be_unauthenticated_when_initial_state', () => {
    const state = useStore.getState();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should_set_session_when_login_called', () => {
    useStore.getState().login(mockTokenData);

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.session?.userId).toBe('user-123');
    expect(state.session?.username).toBe('testuser');
    expect(state.session?.email).toBe('test@example.com');
    expect(state.session?.phone).toBeNull();
  });

  it('should_clear_session_when_logout_called', () => {
    useStore.getState().login(mockTokenData);
    useStore.getState().logout();

    const state = useStore.getState();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should_store_plain_json_when_session_set', () => {
    useStore.getState().login(mockTokenData);
    const session = useStore.getState().session as SessionUser;

    expect(JSON.parse(JSON.stringify(session))).toEqual(session);
  });
});

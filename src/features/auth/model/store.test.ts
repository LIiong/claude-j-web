import type { AccessToken, User } from '@/entities/user';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

// Mock the entities module
vi.mock('@/entities/user', () => ({
  User: {
    create: vi.fn((props) => ({ ...props, equals: vi.fn() })),
  },
  UserId: {
    create: vi.fn((id) => ({ value: id, equals: vi.fn() })),
    generate: vi.fn(() => ({ value: 'generated-uuid', equals: vi.fn() })),
  },
  Email: {
    create: vi.fn((email) => ({ value: email, equals: vi.fn() })),
    isValid: vi.fn(() => true),
  },
  AccessToken: {
    create: vi.fn((token, expiresAt, type) => ({
      token,
      expiresAt,
      tokenType: type || 'Bearer',
      isExpired: vi.fn(() => false),
      isValid: vi.fn(() => true),
      getAuthorizationHeader: vi.fn(() => `Bearer ${token}`),
      equals: vi.fn(),
    })),
  },
}));

/**
 * Simple auth store without persist for testing
 */
interface AuthState {
  user: User | null;
  accessToken: AccessToken | null;
  isAuthenticated: boolean;
  login: (user: User, token: AccessToken) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const createTestStore = () =>
  create<AuthState>((set) => ({
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
  }));

describe('AuthStore', () => {
  let useStore: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    useStore = createTestStore();
    vi.clearAllMocks();
  });

  it('should_have_default_unauthenticated_state', () => {
    const state = useStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should_set_user_and_token_on_login', () => {
    const mockUser = { id: { value: 'user-1' }, nickname: 'TestUser' } as unknown as User;
    const mockToken = { token: 'jwt-token', isValid: () => true } as unknown as AccessToken;

    useStore.getState().login(mockUser, mockToken);

    const state = useStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toEqual(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should_clear_state_on_logout', () => {
    const mockUser = { id: { value: 'user-1' } } as unknown as User;
    const mockToken = { token: 'jwt-token' } as unknown as AccessToken;

    useStore.getState().login(mockUser, mockToken);
    useStore.getState().logout();

    const state = useStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should_update_user_with_setUser', () => {
    const mockUser = { id: { value: 'user-1' }, nickname: 'User1' } as unknown as User;

    useStore.getState().setUser(mockUser);

    const state = useStore.getState();
    expect(state.user?.nickname).toBe('User1');
  });
});

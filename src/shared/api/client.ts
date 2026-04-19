import { config } from '@/shared/config';

const BASE_URL = config.apiBaseUrl;

// Token storage key
const ACCESS_TOKEN_KEY = 'claude_j_access_token';
const REFRESH_TOKEN_KEY = 'claude_j_refresh_token';

export interface FetchOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly body?: unknown;
  readonly signal?: AbortSignal;
  readonly skipAuth?: boolean;
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set auth tokens
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear auth tokens (logout)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if token exists and is not empty
 */
export function hasValidToken(): boolean {
  const token = getAccessToken();
  return token !== null && token.length > 0;
}

/**
 * Main API fetch function with auth support
 */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  // Add auth token if available and not skipped
  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!res.ok) {
    // Handle 401 - token expired
    if (res.status === 401) {
      // TODO: Implement token refresh flow
      clearTokens();
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} @ ${path}`);
  }

  return (await res.json()) as T;
}

import { apiFetch, clearTokens } from '@/shared/api/client';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../model/store';

/**
 * Logout mutation hook
 */
export function useLogout() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      clearTokens();
      logout();
    },
    onError: () => {
      // Even if server logout fails, clear local state
      clearTokens();
      logout();
    },
  });
}

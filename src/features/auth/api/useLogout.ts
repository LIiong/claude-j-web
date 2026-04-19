import { apiFetch } from '@/shared/api/client';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../model/store';

export function useLogout() {
  const { logout, session } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (session?.userId) {
        await apiFetch('/api/v1/auth/logout', {
          method: 'POST',
          body: { userId: session.userId },
        }).catch(() => {});
      }
    },
    onSettled: () => {
      logout();
    },
  });
}

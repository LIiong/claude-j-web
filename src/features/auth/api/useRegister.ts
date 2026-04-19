import { apiFetch } from '@/shared/api/client';
import type { AuthResponseDTO, RegisterDTO } from '@/shared/api/dto/auth';
import { useMutation } from '@tanstack/react-query';

/**
 * Register mutation hook
 */
export function useRegister() {
  return useMutation<AuthResponseDTO, Error, RegisterDTO>({
    mutationFn: async (data) => {
      return await apiFetch<AuthResponseDTO>('/api/v1/auth/register', {
        method: 'POST',
        body: data,
        skipAuth: true,
      });
    },
  });
}

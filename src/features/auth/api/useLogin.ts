import { apiFetch } from '@/shared/api/client';
import type { AuthResponseDTO, LoginCredentialsDTO } from '@/shared/api/dto/auth';
import { useMutation } from '@tanstack/react-query';

/**
 * Login mutation hook
 */
export function useLogin() {
  return useMutation<AuthResponseDTO, Error, LoginCredentialsDTO>({
    mutationFn: async (credentials) => {
      return await apiFetch<AuthResponseDTO>('/api/v1/auth/login', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
      });
    },
  });
}

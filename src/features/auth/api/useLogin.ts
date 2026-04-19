import { apiFetch } from '@/shared/api/client';
import type { AuthResponseDTO, LoginCredentialsDTO } from '@/shared/api/dto/auth';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../model/store';

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  return useMutation<AuthResponseDTO, Error, LoginCredentialsDTO>({
    mutationFn: (credentials) =>
      apiFetch<AuthResponseDTO>('/api/v1/auth/login', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
      }),
    onSuccess: (data) => {
      if (data.success) {
        login(data.data);
      }
    },
  });
}

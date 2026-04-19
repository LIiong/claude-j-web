import { apiFetch } from '@/shared/api/client';
import type { AuthResponseDTO, RegisterFormDTO } from '@/shared/api/dto/auth';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../model/store';

export function useRegister() {
  const login = useAuthStore((state) => state.login);

  return useMutation<AuthResponseDTO, Error, RegisterFormDTO>({
    mutationFn: ({ confirmPassword: _omit, ...apiData }) =>
      apiFetch<AuthResponseDTO>('/api/v1/auth/register', {
        method: 'POST',
        body: apiData,
        skipAuth: true,
      }),
    onSuccess: (data) => {
      if (data.success) {
        login(data.data);
      }
    },
  });
}

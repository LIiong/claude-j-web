import { apiFetch, clearTokens } from '@/shared/api/client';
import type { CartApiResponseDTO, UpdateCartItemQuantityRequestDTO } from '@/shared/api/dto/cart';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<CartApiResponseDTO, Error, UpdateCartItemQuantityRequestDTO>({
    mutationFn: (params) =>
      apiFetch<CartApiResponseDTO>('/api/v1/carts/items/quantity', {
        method: 'PUT',
        body: params,
      }),
    onSuccess: (_, variables) => {
      // Invalidate cart query
      queryClient.invalidateQueries({ queryKey: ['cart', variables.userId] });
    },
    onError: (error) => {
      if (error.message.includes('HTTP 401')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('Update cart item error:', error.message);
      }
    },
  });
}

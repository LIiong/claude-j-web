import { apiFetch, clearTokens } from '@/shared/api/client';
import type { AddCartItemRequestDTO, CartApiResponseDTO } from '@/shared/api/dto/cart';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<CartApiResponseDTO, Error, AddCartItemRequestDTO>({
    mutationFn: (item) =>
      apiFetch<CartApiResponseDTO>('/api/v1/carts/items', {
        method: 'POST',
        body: item,
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
        console.error('Add to cart error:', error.message);
      }
    },
  });
}

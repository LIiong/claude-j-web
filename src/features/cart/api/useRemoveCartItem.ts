import { apiFetch, clearTokens } from '@/shared/api/client';
import type { CartApiResponseDTO, RemoveCartItemRequestDTO } from '@/shared/api/dto/cart';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<CartApiResponseDTO, Error, RemoveCartItemRequestDTO>({
    mutationFn: (params) =>
      apiFetch<CartApiResponseDTO>(
        `/api/v1/carts/items/${params.productId}?userId=${params.userId}`,
        {
          method: 'DELETE',
        },
      ),
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
        console.error('Remove cart item error:', error.message);
      }
    },
  });
}

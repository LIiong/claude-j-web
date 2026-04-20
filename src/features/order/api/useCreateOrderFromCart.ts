import { apiFetch, clearTokens } from '@/shared/api/client';
import type { CreateOrderFromCartRequestDTO, SingleOrderResponseDTO } from '@/shared/api/dto/order';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateOrderFromCart() {
  const queryClient = useQueryClient();

  return useMutation<SingleOrderResponseDTO, Error, CreateOrderFromCartRequestDTO>({
    mutationFn: (params) =>
      apiFetch<SingleOrderResponseDTO>('/api/v1/orders/from-cart', {
        method: 'POST',
        body: params,
      }),
    onSuccess: (_, variables) => {
      // Invalidate orders list and cart
      queryClient.invalidateQueries({ queryKey: ['orders', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['cart', variables.customerId] });
    },
    onError: (error) => {
      if (error.message.includes('HTTP 401')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('Create order from cart error:', error.message);
      }
    },
  });
}

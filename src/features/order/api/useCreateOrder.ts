import { apiFetch, clearTokens } from '@/shared/api/client';
import type { CreateOrderRequestDTO, SingleOrderResponseDTO } from '@/shared/api/dto/order';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<SingleOrderResponseDTO, Error, CreateOrderRequestDTO>({
    mutationFn: (order) =>
      apiFetch<SingleOrderResponseDTO>('/api/v1/orders', {
        method: 'POST',
        body: order,
      }),
    onSuccess: (_, variables) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders', variables.customerId] });
    },
    onError: (error) => {
      if (error.message.includes('HTTP 401')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('Create order error:', error.message);
      }
    },
  });
}

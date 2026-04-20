import { apiFetch, clearTokens } from '@/shared/api/client';
import type { CancelOrderRequestDTO, SingleOrderResponseDTO } from '@/shared/api/dto/order';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<SingleOrderResponseDTO, Error, CancelOrderRequestDTO & { customerId: string }>(
    {
      mutationFn: (params) =>
        apiFetch<SingleOrderResponseDTO>(`/api/v1/orders/${params.orderId}/cancel`, {
          method: 'POST',
        }),
      onSuccess: (_, variables) => {
        // Invalidate order detail and orders list
        queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
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
          console.error('Cancel order error:', error.message);
        }
      },
    },
  );
}

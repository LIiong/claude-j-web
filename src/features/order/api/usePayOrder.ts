import { apiFetch, clearTokens } from '@/shared/api/client';
import type { PayOrderRequestDTO, SingleOrderResponseDTO } from '@/shared/api/dto/order';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation<SingleOrderResponseDTO, Error, PayOrderRequestDTO & { customerId: string }>({
    mutationFn: (params) =>
      apiFetch<SingleOrderResponseDTO>(`/api/v1/orders/${params.orderId}/pay`, {
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
        console.error('Pay order error:', error.message);
      }
    },
  });
}

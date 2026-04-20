import { apiFetch, clearTokens } from '@/shared/api/client';
import type { SingleOrderResponseDTO } from '@/shared/api/dto/order';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useOrderDetail(orderId: string | undefined) {
  const query = useQuery<SingleOrderResponseDTO, Error>({
    queryKey: ['order', orderId],
    queryFn: () => apiFetch<SingleOrderResponseDTO>(`/api/v1/orders/${orderId}`),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Handle error with redirect on 401
  useEffect(() => {
    if (query.error) {
      if (query.error.message.includes('HTTP 401')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('Order detail fetch error:', query.error.message);
      }
    }
  }, [query.error]);

  return query;
}

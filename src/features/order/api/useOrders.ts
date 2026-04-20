import { apiFetch, clearTokens } from '@/shared/api/client';
import type { OrderListResponseDTO } from '@/shared/api/dto/order';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useOrders(userId: string | undefined) {
  const query = useQuery<OrderListResponseDTO, Error>({
    queryKey: ['orders', userId],
    queryFn: () => apiFetch<OrderListResponseDTO>(`/api/v1/orders?customerId=${userId}`),
    enabled: !!userId,
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
        console.error('Orders fetch error:', query.error.message);
      }
    }
  }, [query.error]);

  return query;
}

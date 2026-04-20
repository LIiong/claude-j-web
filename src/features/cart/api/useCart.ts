import { apiFetch, clearTokens } from '@/shared/api/client';
import type { CartApiResponseDTO, GetCartRequestDTO } from '@/shared/api/dto/cart';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useCart(userId: string | undefined) {
  const query = useQuery<CartApiResponseDTO, Error>({
    queryKey: ['cart', userId],
    queryFn: () => apiFetch<CartApiResponseDTO>(`/api/v1/carts?userId=${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        console.error('Cart fetch error:', query.error.message);
      }
    }
  }, [query.error]);

  return query;
}

import type { OrderStatusDTO } from '@/shared/api/dto/order';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrderState } from './store';

// Create test store without persistence
const createTestOrderStore = () =>
  create<OrderState>()(
    devtools((set) => ({
      filters: {},

      setStatusFilter: (status: OrderStatusDTO | undefined) => {
        set((state) => ({
          filters: { ...state.filters, status },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },
    })),
  );

describe('useOrderStore', () => {
  let useTestOrderStore: ReturnType<typeof createTestOrderStore>;

  beforeEach(() => {
    useTestOrderStore = createTestOrderStore();
  });

  describe('setStatusFilter', () => {
    it('should_set_status_filter_when_valid_status', () => {
      const { result } = renderHook(() => useTestOrderStore());

      act(() => {
        result.current.setStatusFilter('PENDING_PAYMENT');
      });

      expect(result.current.filters.status).toBe('PENDING_PAYMENT');
    });

    it('should_update_existing_filter', () => {
      const { result } = renderHook(() => useTestOrderStore());

      act(() => {
        result.current.setStatusFilter('PAID');
        result.current.setStatusFilter('DELIVERED');
      });

      expect(result.current.filters.status).toBe('DELIVERED');
    });

    it('should_clear_status_when_undefined', () => {
      const { result } = renderHook(() => useTestOrderStore());

      act(() => {
        result.current.setStatusFilter('PAID');
        result.current.setStatusFilter(undefined);
      });

      expect(result.current.filters.status).toBeUndefined();
    });
  });

  describe('clearFilters', () => {
    it('should_clear_all_filters', () => {
      const { result } = renderHook(() => useTestOrderStore());

      act(() => {
        result.current.setStatusFilter('PENDING_PAYMENT');
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
      expect(result.current.filters.status).toBeUndefined();
    });

    it('should_work_when_no_filters_set', () => {
      const { result } = renderHook(() => useTestOrderStore());

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({});
    });
  });

  describe('filters', () => {
    it('should_initialize_with_empty_filters', () => {
      const { result } = renderHook(() => useTestOrderStore());

      expect(result.current.filters).toEqual({});
    });

    it('should_support_all_order_statuses', () => {
      const { result } = renderHook(() => useTestOrderStore());
      const statuses: Array<
        | 'PENDING_PAYMENT'
        | 'PAID'
        | 'PROCESSING'
        | 'SHIPPED'
        | 'DELIVERED'
        | 'CANCELLED'
        | 'REFUNDED'
      > = [
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ];

      for (const status of statuses) {
        act(() => {
          result.current.setStatusFilter(status);
        });

        expect(result.current.filters.status).toBe(status);
      }
    });
  });
});

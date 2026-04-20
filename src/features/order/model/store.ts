import type { OrderStatusDTO } from '@/shared/api/dto/order';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface OrderFilters {
  status?: OrderStatusDTO;
}

export interface OrderState {
  filters: OrderFilters;
  setStatusFilter: (status: OrderStatusDTO | undefined) => void;
  clearFilters: () => void;
}

// Base store logic without persistence
const createOrderStore = (persistConfig?: { name: string }) =>
  create<OrderState>()(
    devtools(
      persistConfig
        ? persist(
            (set) => ({
              filters: {},

              setStatusFilter: (status: OrderStatusDTO | undefined) => {
                set((state) => ({
                  filters: { ...state.filters, status },
                }));
              },

              clearFilters: () => {
                set({ filters: {} });
              },
            }),
            {
              name: persistConfig.name,
            },
          )
        : (set) => ({
            filters: {},

            setStatusFilter: (status: OrderStatusDTO | undefined) => {
              set((state) => ({
                filters: { ...state.filters, status },
              }));
            },

            clearFilters: () => {
              set({ filters: {} });
            },
          }),
    ),
  );

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Export store - with persistence in browser, without in SSR/tests
export const useOrderStore = isBrowser
  ? createOrderStore({ name: 'order-store' })
  : createOrderStore();

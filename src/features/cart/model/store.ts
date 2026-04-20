import type { CartItem, CartItemInput } from '@/entities/cart';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface CartState {
  // Selected items for checkout (by productId)
  selectedItems: Set<string>;
  // Local cart operations
  toggleItemSelection: (productId: string) => void;
  selectAll: (productIds: string[]) => void;
  deselectAll: () => void;
  isSelected: (productId: string) => boolean;
}

// Base store logic without persistence
const createCartStore = (persistConfig?: { name: string }) =>
  create<CartState>()(
    devtools(
      persistConfig
        ? persist(
            (set, get) => ({
              selectedItems: new Set<string>(),

              toggleItemSelection: (productId: string) => {
                const current = get().selectedItems;
                const next = new Set(current);
                if (next.has(productId)) {
                  next.delete(productId);
                } else {
                  next.add(productId);
                }
                set({ selectedItems: next });
              },

              selectAll: (productIds: string[]) => {
                set({ selectedItems: new Set(productIds) });
              },

              deselectAll: () => {
                set({ selectedItems: new Set<string>() });
              },

              isSelected: (productId: string) => {
                return get().selectedItems.has(productId);
              },
            }),
            {
              name: persistConfig.name,
              partialize: (state) => ({
                selectedItems: Array.from(state.selectedItems),
              }),
              onRehydrateStorage: () => (state) => {
                if (state) {
                  const selectedItems = new Set<string>(state.selectedItems as unknown as string[]);
                  state.selectedItems = selectedItems;
                }
              },
            },
          )
        : (set, get) => ({
            selectedItems: new Set<string>(),

            toggleItemSelection: (productId: string) => {
              const current = get().selectedItems;
              const next = new Set(current);
              if (next.has(productId)) {
                next.delete(productId);
              } else {
                next.add(productId);
              }
              set({ selectedItems: next });
            },

            selectAll: (productIds: string[]) => {
              set({ selectedItems: new Set(productIds) });
            },

            deselectAll: () => {
              set({ selectedItems: new Set<string>() });
            },

            isSelected: (productId: string) => {
              return get().selectedItems.has(productId);
            },
          }),
    ),
  );

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Export store - with persistence in browser, without in SSR/tests
export const useCartStore = isBrowser ? createCartStore({ name: 'cart-store' }) : createCartStore();

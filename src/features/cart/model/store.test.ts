import { Cart } from '@/entities/cart';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CartState } from './store';

// Create test store without persistence
const createTestCartStore = () =>
  create<CartState>()(
    devtools((set, get) => ({
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
    })),
  );

describe('useCartStore', () => {
  let useTestCartStore: ReturnType<typeof createTestCartStore>;

  beforeEach(() => {
    useTestCartStore = createTestCartStore();
  });

  describe('toggleItemSelection', () => {
    it('should_add_item_to_selection_when_not_selected', () => {
      const { result } = renderHook(() => useTestCartStore());

      act(() => {
        result.current.toggleItemSelection('prod-1');
      });

      expect(result.current.isSelected('prod-1')).toBe(true);
      expect(result.current.selectedItems.size).toBe(1);
    });

    it('should_remove_item_from_selection_when_already_selected', () => {
      const { result } = renderHook(() => useTestCartStore());

      act(() => {
        result.current.toggleItemSelection('prod-1');
        result.current.toggleItemSelection('prod-1');
      });

      expect(result.current.isSelected('prod-1')).toBe(false);
      expect(result.current.selectedItems.size).toBe(0);
    });
  });

  describe('selectAll', () => {
    it('should_select_all_given_product_ids', () => {
      const { result } = renderHook(() => useTestCartStore());

      act(() => {
        result.current.selectAll(['prod-1', 'prod-2', 'prod-3']);
      });

      expect(result.current.isSelected('prod-1')).toBe(true);
      expect(result.current.isSelected('prod-2')).toBe(true);
      expect(result.current.isSelected('prod-3')).toBe(true);
      expect(result.current.selectedItems.size).toBe(3);
    });

    it('should_replace_existing_selection', () => {
      const { result } = renderHook(() => useTestCartStore());

      act(() => {
        result.current.toggleItemSelection('prod-1');
        result.current.selectAll(['prod-2', 'prod-3']);
      });

      expect(result.current.isSelected('prod-1')).toBe(false);
      expect(result.current.isSelected('prod-2')).toBe(true);
      expect(result.current.isSelected('prod-3')).toBe(true);
    });
  });

  describe('deselectAll', () => {
    it('should_clear_all_selections', () => {
      const { result } = renderHook(() => useTestCartStore());

      act(() => {
        result.current.selectAll(['prod-1', 'prod-2', 'prod-3']);
        result.current.deselectAll();
      });

      expect(result.current.selectedItems.size).toBe(0);
      expect(result.current.isSelected('prod-1')).toBe(false);
    });
  });

  describe('isSelected', () => {
    it('should_return_true_when_item_is_selected', () => {
      const { result } = renderHook(() => useTestCartStore());

      act(() => {
        result.current.toggleItemSelection('prod-1');
      });

      expect(result.current.isSelected('prod-1')).toBe(true);
    });

    it('should_return_false_when_item_is_not_selected', () => {
      const { result } = renderHook(() => useTestCartStore());

      expect(result.current.isSelected('nonexistent')).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should_initialize_with_empty_set', () => {
      const { result } = renderHook(() => useTestCartStore());

      expect(result.current.selectedItems).toBeInstanceOf(Set);
      expect(result.current.selectedItems.size).toBe(0);
    });
  });
});

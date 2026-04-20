'use client';

import { useCartStore } from '../model/store';
import type { CartState } from '../model/store';

export interface CartSummaryProps {
  readonly totalAmount: number;
  readonly itemCount: number;
  readonly currency: string;
  readonly onCheckout: () => void;
  readonly isLoading?: boolean;
}

export function CartSummary({
  totalAmount,
  itemCount,
  currency,
  onCheckout,
  isLoading,
}: CartSummaryProps) {
  const selectedItems = useCartStore((state: CartState) => state.selectedItems);
  const selectAll = useCartStore((state: CartState) => state.selectAll);
  const deselectAll = useCartStore((state: CartState) => state.deselectAll);
  const hasSelectedItems = selectedItems.size > 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasSelectedItems}
            onChange={(e) => {
              if (e.target.checked) {
                // Would need productIds from parent - simplified for now
                deselectAll();
              } else {
                deselectAll();
              }
            }}
            className="w-4 h-4 rounded border-gray-300"
            aria-label="Select all items"
          />
          <span className="text-sm text-gray-600">
            {hasSelectedItems ? `${selectedItems.size} selected` : 'Select all'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Currency</span>
          <span>{currency}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>
            {currency} {totalAmount}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md font-medium transition-colors"
        aria-label="Proceed to checkout"
      >
        {isLoading ? 'Processing...' : 'Checkout'}
      </button>
    </div>
  );
}

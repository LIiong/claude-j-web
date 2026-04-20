'use client';

import type { CartItemResponseDTO } from '@/shared/api/dto/cart';
import { useCartStore } from '../model/store';
import type { CartState } from '../model/store';

export interface CartItemProps {
  readonly item: CartItemResponseDTO;
  readonly onUpdateQuantity: (productId: string, quantity: number) => void;
  readonly onRemove: (productId: string) => void;
  readonly isUpdating?: boolean;
  readonly isRemoving?: boolean;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
  isRemoving,
}: CartItemProps) {
  const isSelected = useCartStore((state: CartState) => state.isSelected(item.productId));
  const toggleSelection = useCartStore((state: CartState) => state.toggleItemSelection);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quantity = Number.parseInt(e.target.value, 10);
    onUpdateQuantity(item.productId, quantity);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelection(item.productId)}
        className="w-4 h-4 rounded border-gray-300"
        aria-label={`Select ${item.productName}`}
      />

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.productName}</h3>
        <p className="text-sm text-gray-500">Unit: ¥{item.unitPrice}</p>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor={`qty-${item.productId}`} className="sr-only">
          Quantity
        </label>
        <select
          id={`qty-${item.productId}`}
          value={item.quantity}
          onChange={handleQuantityChange}
          disabled={isUpdating}
          className="block w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        {isUpdating && <span className="text-xs text-gray-400">Updating...</span>}
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[80px]">
        <p className="font-medium text-gray-900">¥{item.subtotal}</p>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        disabled={isRemoving}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
        aria-label={`Remove ${item.productName}`}
      >
        {isRemoving ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
}

'use client';

import type { CartItemResponseDTO } from '@/shared/api/dto/cart';
import { CartItem } from './CartItem';

export interface CartListProps {
  readonly items: CartItemResponseDTO[];
  readonly onUpdateQuantity: (productId: string, quantity: number) => void;
  readonly onRemove: (productId: string) => void;
  readonly updatingItems?: Set<string>;
  readonly removingItems?: Set<string>;
}

export function CartList({
  items,
  onUpdateQuantity,
  onRemove,
  updatingItems,
  removingItems,
}: CartListProps) {
  if (items.length === 0) {
    return <output className="text-center py-8 text-gray-500 block">Your cart is empty</output>;
  }

  return (
    <ul className="divide-y divide-gray-200" aria-label="Cart items">
      {items.map((item) => (
        <li key={item.productId}>
          <CartItem
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            isUpdating={updatingItems?.has(item.productId)}
            isRemoving={removingItems?.has(item.productId)}
          />
        </li>
      ))}
    </ul>
  );
}

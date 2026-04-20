'use client';

import type { OrderResponseDTO } from '@/shared/api/dto/order';
import { OrderCard } from './OrderCard';

export interface OrderListProps {
  readonly orders: OrderResponseDTO[];
  readonly onViewDetail?: (orderId: string) => void;
  readonly isLoading?: boolean;
}

export function OrderList({ orders, onViewDetail, isLoading }: OrderListProps) {
  if (isLoading) {
    return (
      <output className="text-center py-8 text-gray-500 block" aria-label="Loading orders">
        Loading orders...
      </output>
    );
  }

  if (orders.length === 0) {
    return <output className="text-center py-8 text-gray-500 block">No orders found</output>;
  }

  return (
    <ul className="space-y-4" aria-label="Order list">
      {orders.map((order) => (
        <li key={order.orderId}>
          <OrderCard order={order} onViewDetail={onViewDetail} />
        </li>
      ))}
    </ul>
  );
}

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
      <div className="text-center py-8 text-gray-500" role="status" aria-label="Loading orders">
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" role="status">
        No orders found
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Order list">
      {orders.map((order) => (
        <OrderCard key={order.orderId} order={order} onViewDetail={onViewDetail} />
      ))}
    </div>
  );
}

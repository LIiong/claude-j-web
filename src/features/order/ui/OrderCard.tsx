'use client';

import type { OrderResponseDTO } from '@/shared/api/dto/order';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface OrderCardProps {
  readonly order: OrderResponseDTO;
  readonly onViewDetail?: (orderId: string) => void;
}

export function OrderCard({ order, onViewDetail }: OrderCardProps) {
  const handleClick = () => {
    onViewDetail?.(order.orderId);
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Order ${order.orderId}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-gray-500">Order #{order.orderId}</p>
          <p className="text-xs text-gray-400">{new Date(order.createTime).toLocaleDateString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
      </div>

      <div className="mt-2 flex justify-between items-center">
        <p className="text-lg font-bold text-gray-900">
          {order.currency} {order.totalAmount}
        </p>
        <span className="text-blue-600 hover:text-blue-800 text-sm">View Details →</span>
      </div>
    </div>
  );
}

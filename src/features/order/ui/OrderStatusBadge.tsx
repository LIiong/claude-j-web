'use client';

import type { OrderStatusDTO } from '@/shared/api/dto/order';

export interface OrderStatusBadgeProps {
  readonly status: OrderStatusDTO;
}

const statusConfig: Record<OrderStatusDTO, { label: string; bgColor: string; textColor: string }> =
  {
    PENDING_PAYMENT: {
      label: 'Pending Payment',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    PAID: {
      label: 'Paid',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    PROCESSING: {
      label: 'Processing',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
    SHIPPED: {
      label: 'Shipped',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
    },
    DELIVERED: {
      label: 'Delivered',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    CANCELLED: {
      label: 'Cancelled',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    REFUNDED: {
      label: 'Refunded',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
    },
  };

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <output
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
      aria-label={`Order status: ${config.label}`}
    >
      {config.label}
    </output>
  );
}

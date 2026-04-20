'use client';

import type { OrderResponseDTO } from '@/shared/api/dto/order';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface OrderDetailProps {
  readonly order: OrderResponseDTO;
  readonly onPay?: () => void;
  readonly onCancel?: () => void;
  readonly isPaying?: boolean;
  readonly isCancelling?: boolean;
}

export function OrderDetail({ order, onPay, onCancel, isPaying, isCancelling }: OrderDetailProps) {
  const canPay = order.status === 'PENDING_PAYMENT';
  const canCancel =
    order.status === 'PENDING_PAYMENT' || order.status === 'PAID' || order.status === 'PROCESSING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{order.orderId}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created: {new Date(order.createTime).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Updated: {new Date(order.updateTime).toLocaleString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.productId} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {order.currency} {item.unitPrice}
                </p>
              </div>
              <p className="font-medium text-gray-900">
                {order.currency} {item.subtotal}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-gray-900">
            {order.currency} {order.totalAmount}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {canPay && onPay && (
          <button
            onClick={onPay}
            disabled={isPaying}
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-md font-medium transition-colors"
            aria-label="Pay for order"
          >
            {isPaying ? 'Processing...' : 'Pay Now'}
          </button>
        )}
        {canCancel && onCancel && (
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-md font-medium transition-colors"
            aria-label="Cancel order"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  );
}

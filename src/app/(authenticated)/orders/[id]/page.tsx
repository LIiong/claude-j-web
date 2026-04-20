'use client';

import { useAuthStore } from '@/features/auth';
import { useCancelOrder, useOrderDetail, usePayOrder } from '@/features/order';
import { useParams } from 'next/navigation';

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const session = useAuthStore((state) => state.session);

  const { data: orderData, isLoading } = useOrderDetail(orderId);
  const payMutation = usePayOrder();
  const cancelMutation = useCancelOrder();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  const order = orderData?.data;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Order not found</div>
      </div>
    );
  }

  const canPay = order.status === 'PENDING_PAYMENT';
  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'PAID';

  const handlePay = () => {
    if (session?.userId) {
      payMutation.mutate({ orderId, customerId: session.userId });
    }
  };

  const handleCancel = () => {
    if (session?.userId) {
      cancelMutation.mutate({ orderId, customerId: session.userId });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <a href="/orders" className="text-blue-600 hover:text-blue-800">
            ← Back to Orders
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order #{order.orderId}</p>
              <p className="text-xs text-gray-400">
                Placed on {new Date(order.createTime).toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-3">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ¥{item.unitPrice}
                    </p>
                  </div>
                  <p className="font-medium">¥{item.subtotal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>¥{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {canPay && (
            <button
              type="button"
              onClick={handlePay}
              disabled={payMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {payMutation.isPending ? 'Processing...' : 'Pay Now'}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

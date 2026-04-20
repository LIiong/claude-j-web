'use client';

import { useAuthStore } from '@/features/auth';
import { type OrderFilters, useOrderStore, useOrders } from '@/features/order';
import type { OrderStatusDTO } from '@/shared/api/dto/order';

const statusLabels: Record<OrderStatusDTO, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

const statusColors: Record<OrderStatusDTO, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export function OrderWidget() {
  const session = useAuthStore((state) => state.session);
  const { data: ordersData, isLoading } = useOrders(session?.userId);
  const filters = useOrderStore((state) => state.filters);
  const setStatusFilter = useOrderStore((state) => state.setStatusFilter);

  if (isLoading) {
    return <div className="p-4">Loading orders...</div>;
  }

  const orders = ordersData?.data || [];
  const filteredOrders = filters.status
    ? orders.filter((order) => order.status === filters.status)
    : orders;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filters.status || ''}
          onChange={(e) => setStatusFilter((e.target.value as OrderStatusDTO) || undefined)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No orders found</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createTime).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="mt-2">
                <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <p className="text-lg font-bold">¥{order.totalAmount}</p>
                <a
                  href={`/orders/${order.orderId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useAuthStore } from '@/features/auth';
import { useCancelOrder, useOrderDetail, usePayOrder } from '@/features/order';
import { OrderDetail } from '@/features/order/ui/OrderDetail';

export interface OrderDetailWidgetProps {
  readonly orderId: string;
}

export function OrderDetailWidget({ orderId }: OrderDetailWidgetProps) {
  const session = useAuthStore((state) => state.session);
  const { data: orderData, isLoading } = useOrderDetail(orderId);
  const payMutation = usePayOrder();
  const cancelMutation = useCancelOrder();

  if (isLoading) {
    return (
      <output className="p-4 text-center text-gray-500 block">Loading order details...</output>
    );
  }

  const order = orderData?.data;

  if (!order) {
    return (
      <div className="p-4 text-center text-gray-500" role="alert">
        Order not found
      </div>
    );
  }

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
    <div className="bg-white rounded-lg shadow p-6">
      <OrderDetail
        order={order}
        onPay={handlePay}
        onCancel={handleCancel}
        isPaying={payMutation.isPending}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}

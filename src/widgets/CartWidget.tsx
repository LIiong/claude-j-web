'use client';

import { useAuthStore } from '@/features/auth';
import { useCart } from '@/features/cart';

export function CartWidget() {
  const session = useAuthStore((state) => state.session);
  const { data: cartData, isLoading } = useCart(session?.userId);

  if (isLoading) {
    return <div className="p-4">Loading cart...</div>;
  }

  const cart = cartData?.data;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Shopping Cart ({cart.itemCount} items)</h2>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center border-b pb-2">
            <div>
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-gray-500">
                {item.quantity} x ¥{item.unitPrice}
              </p>
            </div>
            <p className="font-bold">¥{item.subtotal}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>¥{cart.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}

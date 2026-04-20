import { CartWidget } from '@/widgets/CartWidget';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <CartWidget />
    </div>
  );
}

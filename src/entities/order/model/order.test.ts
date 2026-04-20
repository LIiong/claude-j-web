import { describe, expect, it } from 'vitest';
import { Order, type OrderStatus } from './order';
import { OrderItem } from './orderItem';

describe('Order', () => {
  const mockItems = [
    OrderItem.create({
      productId: 'prod-1',
      productName: 'Test Product 1',
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    }),
    OrderItem.create({
      productId: 'prod-2',
      productName: 'Test Product 2',
      quantity: 1,
      unitPrice: 150,
      subtotal: 150,
    }),
  ];

  it('should_create_order_when_props_valid', () => {
    const order = Order.create({
      orderId: 'order-123',
      customerId: 'customer-456',
      status: 'PENDING_PAYMENT' as OrderStatus,
      totalAmount: 350,
      currency: 'CNY',
      items: mockItems,
      createTime: new Date('2024-01-01'),
      updateTime: new Date('2024-01-01'),
    });

    expect(order.orderId).toBe('order-123');
    expect(order.customerId).toBe('customer-456');
    expect(order.status).toBe('PENDING_PAYMENT');
    expect(order.totalAmount).toBe(350);
    expect(order.currency).toBe('CNY');
    expect(order.items).toHaveLength(2);
  });

  it('should_throw_when_orderId_is_empty', () => {
    expect(() =>
      Order.create({
        orderId: '',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      }),
    ).toThrow('Order.orderId is required');
  });

  it('should_throw_when_customerId_is_empty', () => {
    expect(() =>
      Order.create({
        orderId: 'order-123',
        customerId: '',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      }),
    ).toThrow('Order.customerId is required');
  });

  it('should_throw_when_totalAmount_is_negative', () => {
    expect(() =>
      Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: -100,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      }),
    ).toThrow('Order.totalAmount cannot be negative');
  });

  it('should_throw_when_currency_is_empty', () => {
    expect(() =>
      Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: '',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      }),
    ).toThrow('Order.currency is required');
  });

  it('should_throw_when_items_is_empty', () => {
    expect(() =>
      Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: [],
        createTime: new Date(),
        updateTime: new Date(),
      }),
    ).toThrow('Order.items cannot be empty');
  });

  it('should_be_frozen_when_created', () => {
    const order = Order.create({
      orderId: 'order-123',
      customerId: 'customer-456',
      status: 'PENDING_PAYMENT' as OrderStatus,
      totalAmount: 350,
      currency: 'CNY',
      items: mockItems,
      createTime: new Date(),
      updateTime: new Date(),
    });

    expect(Object.isFrozen(order)).toBe(true);
  });

  describe('canPay', () => {
    it('should_return_true_when_status_is_PENDING_PAYMENT', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canPay()).toBe(true);
    });

    it('should_return_false_when_status_is_PAID', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PAID' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canPay()).toBe(false);
    });

    it('should_return_false_when_status_is_CANCELLED', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'CANCELLED' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canPay()).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('should_return_true_when_status_is_PENDING_PAYMENT', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canCancel()).toBe(true);
    });

    it('should_return_true_when_status_is_PAID', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PAID' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canCancel()).toBe(true);
    });

    it('should_return_false_when_status_is_SHIPPED', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'SHIPPED' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canCancel()).toBe(false);
    });

    it('should_return_false_when_status_is_CANCELLED', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'CANCELLED' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.canCancel()).toBe(false);
    });
  });

  describe('isFinal', () => {
    it('should_return_true_when_status_is_DELIVERED', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'DELIVERED' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.isFinal()).toBe(true);
    });

    it('should_return_true_when_status_is_CANCELLED', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'CANCELLED' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.isFinal()).toBe(true);
    });

    it('should_return_true_when_status_is_REFUNDED', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'REFUNDED' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.isFinal()).toBe(true);
    });

    it('should_return_false_when_status_is_PENDING_PAYMENT', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date(),
        updateTime: new Date(),
      });

      expect(order.isFinal()).toBe(false);
    });
  });

  describe('withStatus', () => {
    it('should_return_new_order_with_updated_status', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date('2024-01-01'),
        updateTime: new Date('2024-01-01'),
      });

      const paidOrder = order.withStatus('PAID' as OrderStatus);

      expect(paidOrder.status).toBe('PAID');
      expect(order.status).toBe('PENDING_PAYMENT'); // original unchanged
      expect(paidOrder.orderId).toBe(order.orderId); // other fields preserved
    });

    it('should_update_updateTime_when_status_changes', () => {
      const order = Order.create({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date('2024-01-01'),
        updateTime: new Date('2024-01-01'),
      });

      const paidOrder = order.withStatus('PAID' as OrderStatus);

      expect(paidOrder.updateTime.getTime()).toBeGreaterThan(order.updateTime.getTime());
    });
  });

  describe('reconstruct', () => {
    it('should_reconstruct_order_without_validation', () => {
      const order = Order.reconstruct({
        orderId: 'order-123',
        customerId: 'customer-456',
        status: 'PENDING_PAYMENT' as OrderStatus,
        totalAmount: 350,
        currency: 'CNY',
        items: mockItems,
        createTime: new Date('2024-01-01'),
        updateTime: new Date('2024-01-01'),
      });

      expect(order.orderId).toBe('order-123');
    });
  });
});

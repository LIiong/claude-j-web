import { describe, expect, it } from 'vitest';
import { OrderItem } from './orderItem';

describe('OrderItem', () => {
  it('should_create_orderItem_when_props_valid', () => {
    const item = OrderItem.create({
      productId: 'prod-1',
      productName: 'Test Product',
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    });

    expect(item.productId).toBe('prod-1');
    expect(item.productName).toBe('Test Product');
    expect(item.quantity).toBe(2);
    expect(item.unitPrice).toBe(100);
    expect(item.subtotal).toBe(200);
  });

  it('should_throw_when_productId_is_empty', () => {
    expect(() =>
      OrderItem.create({
        productId: '',
        productName: 'Test Product',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200,
      }),
    ).toThrow('OrderItem.productId is required');
  });

  it('should_throw_when_productName_is_empty', () => {
    expect(() =>
      OrderItem.create({
        productId: 'prod-1',
        productName: '',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200,
      }),
    ).toThrow('OrderItem.productName is required');
  });

  it('should_throw_when_quantity_is_zero', () => {
    expect(() =>
      OrderItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        quantity: 0,
        unitPrice: 100,
        subtotal: 0,
      }),
    ).toThrow('OrderItem.quantity must be positive');
  });

  it('should_throw_when_quantity_is_negative', () => {
    expect(() =>
      OrderItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        quantity: -1,
        unitPrice: 100,
        subtotal: -100,
      }),
    ).toThrow('OrderItem.quantity must be positive');
  });

  it('should_throw_when_unitPrice_is_negative', () => {
    expect(() =>
      OrderItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        quantity: 2,
        unitPrice: -100,
        subtotal: -200,
      }),
    ).toThrow('OrderItem.unitPrice cannot be negative');
  });

  it('should_be_frozen_when_created', () => {
    const item = OrderItem.create({
      productId: 'prod-1',
      productName: 'Test Product',
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    });

    expect(Object.isFrozen(item)).toBe(true);
  });

  describe('calculateSubtotal', () => {
    it('should_return_correct_subtotal', () => {
      const subtotal = OrderItem.calculateSubtotal(3, 100);
      expect(subtotal).toBe(300);
    });

    it('should_handle_decimal_prices', () => {
      const subtotal = OrderItem.calculateSubtotal(2, 99.99);
      expect(subtotal).toBe(199.98);
    });
  });

  describe('withQuantity', () => {
    it('should_return_new_item_with_updated_quantity', () => {
      const item = OrderItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200,
      });

      const updatedItem = item.withQuantity(5);

      expect(updatedItem.quantity).toBe(5);
      expect(updatedItem.subtotal).toBe(500);
      expect(item.quantity).toBe(2); // original unchanged
    });

    it('should_throw_when_quantity_is_zero', () => {
      const item = OrderItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200,
      });

      expect(() => item.withQuantity(0)).toThrow('Quantity must be positive');
    });

    it('should_throw_when_quantity_is_negative', () => {
      const item = OrderItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200,
      });

      expect(() => item.withQuantity(-1)).toThrow('Quantity must be positive');
    });
  });
});

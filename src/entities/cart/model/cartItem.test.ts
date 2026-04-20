import { describe, expect, it } from 'vitest';
import { CartItem } from './cartItem';

describe('CartItem', () => {
  it('should_create_cartItem_when_props_valid', () => {
    const item = CartItem.create({
      productId: 'prod-1',
      productName: 'Test Product',
      unitPrice: 100,
      quantity: 2,
      subtotal: 200,
    });

    expect(item.productId).toBe('prod-1');
    expect(item.productName).toBe('Test Product');
    expect(item.unitPrice).toBe(100);
    expect(item.quantity).toBe(2);
    expect(item.subtotal).toBe(200);
  });

  it('should_throw_when_productId_is_empty', () => {
    expect(() =>
      CartItem.create({
        productId: '',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      }),
    ).toThrow('CartItem.productId is required');
  });

  it('should_throw_when_productName_is_empty', () => {
    expect(() =>
      CartItem.create({
        productId: 'prod-1',
        productName: '',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      }),
    ).toThrow('CartItem.productName is required');
  });

  it('should_throw_when_quantity_is_zero', () => {
    expect(() =>
      CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 0,
        subtotal: 0,
      }),
    ).toThrow('CartItem.quantity must be positive');
  });

  it('should_throw_when_quantity_is_negative', () => {
    expect(() =>
      CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: -1,
        subtotal: -100,
      }),
    ).toThrow('CartItem.quantity must be positive');
  });

  it('should_throw_when_unitPrice_is_negative', () => {
    expect(() =>
      CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: -100,
        quantity: 2,
        subtotal: -200,
      }),
    ).toThrow('CartItem.unitPrice cannot be negative');
  });

  it('should_be_frozen_when_created', () => {
    const item = CartItem.create({
      productId: 'prod-1',
      productName: 'Test Product',
      unitPrice: 100,
      quantity: 2,
      subtotal: 200,
    });

    expect(Object.isFrozen(item)).toBe(true);
  });

  describe('calculateSubtotal', () => {
    it('should_return_correct_subtotal', () => {
      const subtotal = CartItem.calculateSubtotal(3, 100);
      expect(subtotal).toBe(300);
    });

    it('should_handle_decimal_prices', () => {
      const subtotal = CartItem.calculateSubtotal(2, 99.99);
      expect(subtotal).toBe(199.98);
    });
  });

  describe('withQuantity', () => {
    it('should_return_new_item_with_updated_quantity', () => {
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      const updatedItem = item.withQuantity(5);

      expect(updatedItem.quantity).toBe(5);
      expect(updatedItem.subtotal).toBe(500);
      expect(item.quantity).toBe(2); // original unchanged
    });

    it('should_throw_when_quantity_is_zero', () => {
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      expect(() => item.withQuantity(0)).toThrow('Quantity must be positive');
    });

    it('should_throw_when_quantity_is_negative', () => {
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      expect(() => item.withQuantity(-1)).toThrow('Quantity must be positive');
    });

    it('should_throw_when_quantity_exceeds_max', () => {
      const item = CartItem.create({
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      expect(() => item.withQuantity(1000)).toThrow('Quantity exceeds maximum allowed');
    });
  });

  describe('equals', () => {
    it('should_return_true_when_same_productId', () => {
      const item1 = CartItem.create({
        productId: 'prod-1',
        productName: 'Product A',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      const item2 = CartItem.create({
        productId: 'prod-1',
        productName: 'Product B',
        unitPrice: 150,
        quantity: 3,
        subtotal: 450,
      });

      expect(item1.equals(item2)).toBe(true);
    });

    it('should_return_false_when_different_productId', () => {
      const item1 = CartItem.create({
        productId: 'prod-1',
        productName: 'Product A',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      const item2 = CartItem.create({
        productId: 'prod-2',
        productName: 'Product A',
        unitPrice: 100,
        quantity: 2,
        subtotal: 200,
      });

      expect(item1.equals(item2)).toBe(false);
    });
  });
});

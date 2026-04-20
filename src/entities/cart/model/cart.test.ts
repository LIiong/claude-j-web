import { describe, expect, it } from 'vitest';
import { Cart } from './cart';
import { CartItem } from './cartItem';

describe('Cart', () => {
  const mockItem = CartItem.create({
    productId: 'prod-1',
    productName: 'Test Product',
    unitPrice: 100,
    quantity: 2,
    subtotal: 200,
  });

  describe('create', () => {
    it('should_create_cart_when_props_valid', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      expect(cart.userId).toBe('user-123');
      expect(cart.items).toHaveLength(1);
      expect(cart.totalAmount).toBe(200);
      expect(cart.currency).toBe('CNY');
      expect(cart.itemCount).toBe(2);
    });

    it('should_create_empty_cart', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: new Date('2024-01-01'),
      });

      expect(cart.items).toHaveLength(0);
      expect(cart.totalAmount).toBe(0);
      expect(cart.isEmpty()).toBe(true);
    });

    it('should_throw_when_userId_is_empty', () => {
      expect(() =>
        Cart.create({
          userId: '',
          items: [],
          totalAmount: 0,
          currency: 'CNY',
          itemCount: 0,
          updateTime: new Date(),
        }),
      ).toThrow('Cart.userId is required');
    });

    it('should_throw_when_currency_is_empty', () => {
      expect(() =>
        Cart.create({
          userId: 'user-123',
          items: [],
          totalAmount: 0,
          currency: '',
          itemCount: 0,
          updateTime: new Date(),
        }),
      ).toThrow('Cart.currency is required');
    });

    it('should_be_frozen_when_created', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      expect(Object.isFrozen(cart)).toBe(true);
      expect(Object.isFrozen(cart.items)).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should_return_true_when_no_items', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: new Date(),
      });

      expect(cart.isEmpty()).toBe(true);
    });

    it('should_return_false_when_has_items', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      expect(cart.isEmpty()).toBe(false);
    });
  });

  describe('findItem', () => {
    it('should_return_item_when_found', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      const found = cart.findItem('prod-1');
      expect(found).toBeDefined();
      expect(found?.productId).toBe('prod-1');
    });

    it('should_return_undefined_when_not_found', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      const found = cart.findItem('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('addItem', () => {
    it('should_add_new_item_to_cart', () => {
      const emptyCart = Cart.create({
        userId: 'user-123',
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: new Date('2024-01-01'),
      });

      const newItem = {
        productId: 'prod-2',
        productName: 'New Product',
        unitPrice: 50,
        quantity: 3,
      };

      const updatedCart = emptyCart.addItem(newItem);

      expect(updatedCart.items).toHaveLength(1);
      const item = updatedCart.items[0];
      expect(item?.productId).toBe('prod-2');
      expect(item?.quantity).toBe(3);
      expect(updatedCart.totalAmount).toBe(150);
      expect(updatedCart.itemCount).toBe(3);
      expect(emptyCart.items).toHaveLength(0); // original unchanged
    });

    it('should_merge_quantity_when_item_exists', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const existingItem = {
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 3,
      };

      const updatedCart = cart.addItem(existingItem);

      expect(updatedCart.items).toHaveLength(1);
      const firstItem = updatedCart.items[0];
      expect(firstItem?.quantity).toBe(5); // 2 + 3
      expect(firstItem?.subtotal).toBe(500); // 5 * 100
      expect(updatedCart.totalAmount).toBe(500);
      expect(updatedCart.itemCount).toBe(5);
    });

    it('should_throw_when_quantity_exceeds_max', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      const newItem = {
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 1000, // This would exceed 999
      };

      expect(() => cart.addItem(newItem)).toThrow('Quantity exceeds maximum allowed');
    });

    it('should_update_updateTime_when_adding_item', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [],
        totalAmount: 0,
        currency: 'CNY',
        itemCount: 0,
        updateTime: new Date('2024-01-01'),
      });

      const newItem = {
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: 100,
        quantity: 1,
      };

      const updatedCart = cart.addItem(newItem);

      expect(updatedCart.updateTime.getTime()).toBeGreaterThan(cart.updateTime.getTime());
    });
  });

  describe('updateQuantity', () => {
    it('should_update_quantity_when_item_exists', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const updatedCart = cart.updateQuantity('prod-1', 5);

      const firstItem = updatedCart.items[0];
      expect(firstItem?.quantity).toBe(5);
      expect(firstItem?.subtotal).toBe(500);
      expect(updatedCart.totalAmount).toBe(500);
      expect(updatedCart.itemCount).toBe(5);
    });

    it('should_remove_item_when_quantity_is_zero', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      const updatedCart = cart.updateQuantity('prod-1', 0);

      expect(updatedCart.items).toHaveLength(0);
      expect(updatedCart.isEmpty()).toBe(true);
      expect(updatedCart.totalAmount).toBe(0);
    });

    it('should_throw_when_item_not_found', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      expect(() => cart.updateQuantity('non-existent', 5)).toThrow('Item not found in cart');
    });

    it('should_throw_when_quantity_exceeds_max', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      expect(() => cart.updateQuantity('prod-1', 1000)).toThrow('Quantity exceeds maximum allowed');
    });

    it('should_update_updateTime_when_updating_quantity', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const updatedCart = cart.updateQuantity('prod-1', 5);

      expect(updatedCart.updateTime.getTime()).toBeGreaterThan(cart.updateTime.getTime());
    });
  });

  describe('removeItem', () => {
    it('should_remove_item_when_exists', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const updatedCart = cart.removeItem('prod-1');

      expect(updatedCart.items).toHaveLength(0);
      expect(updatedCart.totalAmount).toBe(0);
      expect(updatedCart.itemCount).toBe(0);
      expect(cart.items).toHaveLength(1); // original unchanged
    });

    it('should_return_same_cart_when_item_not_found', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date(),
      });

      const updatedCart = cart.removeItem('non-existent');

      expect(updatedCart.items).toHaveLength(1);
      expect(updatedCart.totalAmount).toBe(200);
    });

    it('should_update_updateTime_when_removing_item', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const updatedCart = cart.removeItem('prod-1');

      expect(updatedCart.updateTime.getTime()).toBeGreaterThan(cart.updateTime.getTime());
    });
  });

  describe('clear', () => {
    it('should_remove_all_items', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const clearedCart = cart.clear();

      expect(clearedCart.items).toHaveLength(0);
      expect(clearedCart.totalAmount).toBe(0);
      expect(clearedCart.itemCount).toBe(0);
      expect(clearedCart.isEmpty()).toBe(true);
      expect(cart.items).toHaveLength(1); // original unchanged
    });

    it('should_update_updateTime_when_clearing', () => {
      const cart = Cart.create({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      const clearedCart = cart.clear();

      expect(clearedCart.updateTime.getTime()).toBeGreaterThan(cart.updateTime.getTime());
    });
  });

  describe('reconstruct', () => {
    it('should_reconstruct_cart_without_validation', () => {
      const cart = Cart.reconstruct({
        userId: 'user-123',
        items: [mockItem],
        totalAmount: 200,
        currency: 'CNY',
        itemCount: 2,
        updateTime: new Date('2024-01-01'),
      });

      expect(cart.userId).toBe('user-123');
      expect(cart.items).toHaveLength(1);
    });
  });
});

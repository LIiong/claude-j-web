import { CartItem, type CartItemInput } from './cartItem';

export { CartItem, type CartItemInput };

/**
 * Maximum quantity allowed for cart items
 */
export const MAX_CART_ITEM_QUANTITY = 999;

/**
 * Cart aggregate root props
 */
export interface CartProps {
  readonly userId: string;
  readonly items: CartItem[];
  readonly totalAmount: number;
  readonly currency: string;
  readonly itemCount: number;
  readonly updateTime: Date;
}

/**
 * Cart aggregate root - immutable entity with business invariants
 * Encapsulates cart operations and calculations
 */
export class Cart {
  readonly userId: string;
  readonly items: readonly CartItem[];
  readonly totalAmount: number;
  readonly currency: string;
  readonly itemCount: number;
  readonly updateTime: Date;

  private constructor(props: CartProps) {
    this.userId = props.userId;
    this.items = Object.freeze([...props.items]);
    this.totalAmount = props.totalAmount;
    this.currency = props.currency;
    this.itemCount = props.itemCount;
    this.updateTime = props.updateTime;

    Object.freeze(this);
  }

  /**
   * Factory method with validation
   */
  static create(props: CartProps): Cart {
    if (!props.userId || props.userId.trim() === '') {
      throw new Error('Cart.userId is required');
    }
    if (!props.currency || props.currency.trim() === '') {
      throw new Error('Cart.currency is required');
    }

    return new Cart(props);
  }

  /**
   * Factory method for reconstructing from persistence (no validation)
   */
  static reconstruct(props: CartProps): Cart {
    return new Cart(props);
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Find item by productId
   */
  findItem(productId: string): CartItem | undefined {
    return this.items.find((item) => item.productId === productId);
  }

  /**
   * Calculate total amount from items
   */
  private static calculateTotal(items: CartItem[]): number {
    return Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  }

  /**
   * Calculate total item count
   */
  private static calculateItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Add or merge item to cart
   * If item exists, quantities are merged
   */
  addItem(input: CartItemInput): Cart {
    const existingItem = this.findItem(input.productId);
    let newItems: CartItem[];

    if (existingItem) {
      // Merge quantities
      const newQuantity = existingItem.quantity + input.quantity;
      if (newQuantity > MAX_CART_ITEM_QUANTITY) {
        throw new Error('Quantity exceeds maximum allowed');
      }
      newItems = this.items.map((item) =>
        item.productId === input.productId ? item.withQuantity(newQuantity) : item,
      );
    } else {
      // Add new item
      if (input.quantity > MAX_CART_ITEM_QUANTITY) {
        throw new Error('Quantity exceeds maximum allowed');
      }
      const newItem = CartItem.create({
        productId: input.productId,
        productName: input.productName,
        unitPrice: input.unitPrice,
        quantity: input.quantity,
        subtotal: CartItem.calculateSubtotal(input.quantity, input.unitPrice),
      });
      newItems = [...this.items, newItem];
    }

    return new Cart({
      ...this,
      items: newItems,
      totalAmount: Cart.calculateTotal(newItems),
      itemCount: Cart.calculateItemCount(newItems),
      updateTime: new Date(),
    });
  }

  /**
   * Update item quantity
   * If quantity is 0, item is removed
   */
  updateQuantity(productId: string, quantity: number): Cart {
    if (quantity > MAX_CART_ITEM_QUANTITY) {
      throw new Error('Quantity exceeds maximum allowed');
    }

    const item = this.findItem(productId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    const newItems = this.items.map((cartItem) =>
      cartItem.productId === productId ? cartItem.withQuantity(quantity) : cartItem,
    );

    return new Cart({
      ...this,
      items: newItems,
      totalAmount: Cart.calculateTotal(newItems),
      itemCount: Cart.calculateItemCount(newItems),
      updateTime: new Date(),
    });
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: string): Cart {
    const item = this.findItem(productId);
    if (!item) {
      return this;
    }

    const newItems = this.items.filter((item) => item.productId !== productId);

    return new Cart({
      ...this,
      items: newItems,
      totalAmount: Cart.calculateTotal(newItems),
      itemCount: Cart.calculateItemCount(newItems),
      updateTime: new Date(),
    });
  }

  /**
   * Clear all items from cart
   */
  clear(): Cart {
    return new Cart({
      ...this,
      items: [],
      totalAmount: 0,
      itemCount: 0,
      updateTime: new Date(),
    });
  }
}

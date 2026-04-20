/**
 * Maximum quantity allowed for cart items
 */
export const MAX_CART_ITEM_QUANTITY = 999;

/**
 * CartItem value object props
 */
export interface CartItemProps {
  readonly productId: string;
  readonly productName: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;
}

/**
 * Input for adding/updating cart items
 */
export interface CartItemInput {
  readonly productId: string;
  readonly productName: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

/**
 * CartItem - immutable value object for cart line items
 */
export class CartItem {
  readonly productId: string;
  readonly productName: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly subtotal: number;

  private constructor(props: CartItemProps) {
    this.productId = props.productId;
    this.productName = props.productName;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.subtotal = props.subtotal;

    Object.freeze(this);
  }

  /**
   * Factory method with validation
   */
  static create(props: CartItemProps): CartItem {
    if (!props.productId || props.productId.trim() === '') {
      throw new Error('CartItem.productId is required');
    }
    if (!props.productName || props.productName.trim() === '') {
      throw new Error('CartItem.productName is required');
    }
    if (props.quantity <= 0) {
      throw new Error('CartItem.quantity must be positive');
    }
    if (props.unitPrice < 0) {
      throw new Error('CartItem.unitPrice cannot be negative');
    }

    return new CartItem(props);
  }

  /**
   * Calculate subtotal from quantity and unit price
   */
  static calculateSubtotal(quantity: number, unitPrice: number): number {
    return Number((quantity * unitPrice).toFixed(2));
  }

  /**
   * Return new CartItem with updated quantity (recalculates subtotal)
   */
  withQuantity(newQuantity: number): CartItem {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (newQuantity > MAX_CART_ITEM_QUANTITY) {
      throw new Error('Quantity exceeds maximum allowed');
    }
    return new CartItem({
      ...this,
      quantity: newQuantity,
      subtotal: CartItem.calculateSubtotal(newQuantity, this.unitPrice),
    });
  }

  /**
   * Check equality based on productId
   */
  equals(other: CartItem): boolean {
    return this.productId === other.productId;
  }
}

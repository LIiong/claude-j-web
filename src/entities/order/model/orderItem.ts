/**
 * Order status enum - matches backend OrderStatus
 */
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

/**
 * OrderItem value object props
 */
export interface OrderItemProps {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;
}

/**
 * OrderItem - immutable value object for order line items
 */
export class OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;

  private constructor(props: OrderItemProps) {
    this.productId = props.productId;
    this.productName = props.productName;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.subtotal = props.subtotal;

    Object.freeze(this);
  }

  /**
   * Factory method with validation
   */
  static create(props: OrderItemProps): OrderItem {
    if (!props.productId || props.productId.trim() === '') {
      throw new Error('OrderItem.productId is required');
    }
    if (!props.productName || props.productName.trim() === '') {
      throw new Error('OrderItem.productName is required');
    }
    if (props.quantity <= 0) {
      throw new Error('OrderItem.quantity must be positive');
    }
    if (props.unitPrice < 0) {
      throw new Error('OrderItem.unitPrice cannot be negative');
    }

    return new OrderItem(props);
  }

  /**
   * Calculate subtotal from quantity and unit price
   */
  static calculateSubtotal(quantity: number, unitPrice: number): number {
    return Number((quantity * unitPrice).toFixed(2));
  }

  /**
   * Return new OrderItem with updated quantity (recalculates subtotal)
   */
  withQuantity(newQuantity: number): OrderItem {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    return new OrderItem({
      ...this,
      quantity: newQuantity,
      subtotal: OrderItem.calculateSubtotal(newQuantity, this.unitPrice),
    });
  }

  /**
   * Check equality based on productId
   */
  equals(other: OrderItem): boolean {
    return this.productId === other.productId;
  }
}

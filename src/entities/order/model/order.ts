import type { OrderItem } from './orderItem';
import type { OrderStatus } from './orderItem';

export type { OrderStatus };

/**
 * Order aggregate root props
 */
export interface OrderProps {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: OrderStatus;
  readonly totalAmount: number;
  readonly currency: string;
  readonly items: OrderItem[];
  readonly createTime: Date;
  readonly updateTime: Date;
}

/**
 * Order aggregate root - immutable entity with business invariants
 * Encapsulates order lifecycle rules and state transitions
 */
export class Order {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: OrderStatus;
  readonly totalAmount: number;
  readonly currency: string;
  readonly items: readonly OrderItem[];
  readonly createTime: Date;
  readonly updateTime: Date;

  private constructor(props: OrderProps) {
    this.orderId = props.orderId;
    this.customerId = props.customerId;
    this.status = props.status;
    this.totalAmount = props.totalAmount;
    this.currency = props.currency;
    this.items = Object.freeze([...props.items]);
    this.createTime = props.createTime;
    this.updateTime = props.updateTime;

    Object.freeze(this);
  }

  /**
   * Factory method with validation
   */
  static create(props: OrderProps): Order {
    if (!props.orderId || props.orderId.trim() === '') {
      throw new Error('Order.orderId is required');
    }
    if (!props.customerId || props.customerId.trim() === '') {
      throw new Error('Order.customerId is required');
    }
    if (props.totalAmount < 0) {
      throw new Error('Order.totalAmount cannot be negative');
    }
    if (!props.currency || props.currency.trim() === '') {
      throw new Error('Order.currency is required');
    }
    if (!props.items || props.items.length === 0) {
      throw new Error('Order.items cannot be empty');
    }

    return new Order(props);
  }

  /**
   * Factory method for reconstructing from persistence (no validation)
   */
  static reconstruct(props: OrderProps): Order {
    return new Order(props);
  }

  /**
   * Check if order can be paid
   * Only PENDING_PAYMENT orders can be paid
   */
  canPay(): boolean {
    return this.status === 'PENDING_PAYMENT';
  }

  /**
   * Check if order can be cancelled
   * Orders can be cancelled before they are shipped
   */
  canCancel(): boolean {
    return (
      this.status === 'PENDING_PAYMENT' || this.status === 'PAID' || this.status === 'PROCESSING'
    );
  }

  /**
   * Check if order is in final state
   * Final states: DELIVERED, CANCELLED, REFUNDED
   */
  isFinal(): boolean {
    return this.status === 'DELIVERED' || this.status === 'CANCELLED' || this.status === 'REFUNDED';
  }

  /**
   * Return new Order with updated status (immutable)
   * Updates updateTime automatically
   */
  withStatus(newStatus: OrderStatus): Order {
    return new Order({
      orderId: this.orderId,
      customerId: this.customerId,
      status: newStatus,
      totalAmount: this.totalAmount,
      currency: this.currency,
      items: [...this.items],
      createTime: this.createTime,
      updateTime: new Date(),
    });
  }

  /**
   * Check equality based on orderId
   */
  equals(other: Order): boolean {
    return this.orderId === other.orderId;
  }
}

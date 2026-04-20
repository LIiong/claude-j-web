import { Order, OrderItem } from '@/entities/order';
import type { OrderStatus } from '@/entities/order';
import type {
  OrderListResponseDTO,
  OrderResponseDTO,
  SingleOrderResponseDTO,
} from '@/shared/api/dto/order';

/**
 * Map order status DTO to entity status
 */
function toOrderStatus(status: string): OrderStatus {
  const validStatuses: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  if (validStatuses.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }
  throw new Error(`Invalid order status: ${status}`);
}

/**
 * Map OrderItem DTO to OrderItem Entity
 */
function toOrderItemEntity(dto: {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}): OrderItem {
  return OrderItem.create({
    productId: dto.productId,
    productName: dto.productName,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    subtotal: dto.subtotal,
  });
}

/**
 * Map Order DTO to Order Entity
 */
export function toOrderEntity(dto: OrderResponseDTO): Order {
  const items = dto.items.map((item) => toOrderItemEntity(item));

  return Order.reconstruct({
    orderId: dto.orderId,
    customerId: dto.customerId,
    status: toOrderStatus(dto.status),
    totalAmount: dto.totalAmount,
    currency: dto.currency,
    items,
    createTime: new Date(dto.createTime),
    updateTime: new Date(dto.updateTime),
  });
}

/**
 * Map Order List Response to Entity array
 */
export function toOrderEntitiesFromListResponse(dto: OrderListResponseDTO): Order[] {
  if (!dto.success || !dto.data) {
    return [];
  }
  return dto.data.map((order) => toOrderEntity(order));
}

/**
 * Map Single Order Response to Entity (or null if no data)
 */
export function toOrderEntityFromResponse(dto: SingleOrderResponseDTO): Order | null {
  if (!dto.success || !dto.data) {
    return null;
  }
  return toOrderEntity(dto.data);
}

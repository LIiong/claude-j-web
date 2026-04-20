import { Cart, CartItem } from '@/entities/cart';
import type {
  CartApiResponseDTO,
  CartItemResponseDTO,
  CartResponseDTO,
} from '@/shared/api/dto/cart';

/**
 * Map CartItem DTO to CartItem Entity
 */
export function toCartItemEntity(dto: CartItemResponseDTO): CartItem {
  return CartItem.create({
    productId: dto.productId,
    productName: dto.productName,
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    subtotal: dto.subtotal,
  });
}

/**
 * Map Cart DTO to Cart Entity
 */
export function toCartEntity(dto: CartResponseDTO): Cart {
  const items = dto.items.map((item) => toCartItemEntity(item));

  return Cart.reconstruct({
    userId: dto.userId,
    items,
    totalAmount: dto.totalAmount,
    currency: dto.currency,
    itemCount: dto.itemCount,
    updateTime: new Date(dto.updateTime),
  });
}

/**
 * Map Cart API Response to Entity (or null if no data)
 */
export function toCartEntityFromResponse(dto: CartApiResponseDTO): Cart | null {
  if (!dto.success || !dto.data) {
    return null;
  }
  return toCartEntity(dto.data);
}

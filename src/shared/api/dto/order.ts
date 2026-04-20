import { z } from 'zod';

// ─── Order Status ───────────────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export type OrderStatusDTO = z.infer<typeof OrderStatusSchema>;

// ─── Order Item ─────────────────────────────────────────────────────────────────

export const OrderItemResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  subtotal: z.number(),
});

export const OrderItemRequestSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export type OrderItemResponseDTO = z.infer<typeof OrderItemResponseSchema>;
export type OrderItemRequestDTO = z.infer<typeof OrderItemRequestSchema>;

// ─── Order Response ─────────────────────────────────────────────────────────────

export const OrderResponseSchema = z.object({
  orderId: z.string(),
  customerId: z.string(),
  status: OrderStatusSchema,
  totalAmount: z.number(),
  currency: z.string(),
  items: z.array(OrderItemResponseSchema),
  createTime: z.string().datetime(),
  updateTime: z.string().datetime(),
});

export const OrderListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(OrderResponseSchema),
  errorCode: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export const SingleOrderResponseSchema = z.object({
  success: z.boolean(),
  data: OrderResponseSchema.nullable(),
  errorCode: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export type OrderResponseDTO = z.infer<typeof OrderResponseSchema>;
export type OrderListResponseDTO = z.infer<typeof OrderListResponseSchema>;
export type SingleOrderResponseDTO = z.infer<typeof SingleOrderResponseSchema>;

// ─── Order Request ──────────────────────────────────────────────────────────────

export const CreateOrderRequestSchema = z.object({
  customerId: z.string(),
  items: z.array(OrderItemRequestSchema).min(1, 'Order must have at least one item'),
});

export const CreateOrderFromCartRequestSchema = z.object({
  customerId: z.string(),
  couponId: z.string().optional(),
});

export const PayOrderRequestSchema = z.object({
  orderId: z.string(),
});

export const CancelOrderRequestSchema = z.object({
  orderId: z.string(),
});

export type CreateOrderRequestDTO = z.infer<typeof CreateOrderRequestSchema>;
export type CreateOrderFromCartRequestDTO = z.infer<typeof CreateOrderFromCartRequestSchema>;
export type PayOrderRequestDTO = z.infer<typeof PayOrderRequestSchema>;
export type CancelOrderRequestDTO = z.infer<typeof CancelOrderRequestSchema>;

// ─── Get Orders Query ───────────────────────────────────────────────────────────

export const GetOrdersQuerySchema = z.object({
  customerId: z.string(),
  status: OrderStatusSchema.optional(),
});

export type GetOrdersQueryDTO = z.infer<typeof GetOrdersQuerySchema>;

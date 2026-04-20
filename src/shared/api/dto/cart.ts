import { z } from 'zod';

// ─── Cart Item ──────────────────────────────────────────────────────────────────

export const CartItemResponseSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  unitPrice: z.number(),
  quantity: z.number().int().min(1),
  subtotal: z.number(),
});

export const CartItemInputSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  unitPrice: z.number().min(0),
  quantity: z.number().int().min(1).max(999, 'Quantity cannot exceed 999'),
});

export type CartItemResponseDTO = z.infer<typeof CartItemResponseSchema>;
export type CartItemInputDTO = z.infer<typeof CartItemInputSchema>;

// ─── Cart Response ──────────────────────────────────────────────────────────────

export const CartResponseSchema = z.object({
  userId: z.string(),
  items: z.array(CartItemResponseSchema),
  totalAmount: z.number(),
  currency: z.string(),
  itemCount: z.number().int(),
  updateTime: z.string().datetime(),
});

export const CartApiResponseSchema = z.object({
  success: z.boolean(),
  data: CartResponseSchema.nullable(),
  errorCode: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export type CartResponseDTO = z.infer<typeof CartResponseSchema>;
export type CartApiResponseDTO = z.infer<typeof CartApiResponseSchema>;

// ─── Cart Request ───────────────────────────────────────────────────────────────

export const GetCartRequestSchema = z.object({
  userId: z.string(),
});

export const AddCartItemRequestSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  productName: z.string(),
  unitPrice: z.number().min(0),
  quantity: z.number().int().min(1).max(999),
});

export const UpdateCartItemQuantityRequestSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().min(0).max(999),
});

export const RemoveCartItemRequestSchema = z.object({
  userId: z.string(),
  productId: z.string(),
});

export const ClearCartRequestSchema = z.object({
  userId: z.string(),
});

export type GetCartRequestDTO = z.infer<typeof GetCartRequestSchema>;
export type AddCartItemRequestDTO = z.infer<typeof AddCartItemRequestSchema>;
export type UpdateCartItemQuantityRequestDTO = z.infer<typeof UpdateCartItemQuantityRequestSchema>;
export type RemoveCartItemRequestDTO = z.infer<typeof RemoveCartItemRequestSchema>;
export type ClearCartRequestDTO = z.infer<typeof ClearCartRequestSchema>;

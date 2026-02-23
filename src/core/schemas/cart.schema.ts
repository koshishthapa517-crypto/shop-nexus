import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Product ID must be a valid UUID'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
      })
    )
    .min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    message: 'Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED',
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

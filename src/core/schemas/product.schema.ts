import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string(),
  price: z.number().positive('Price must be a positive number'),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  image: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

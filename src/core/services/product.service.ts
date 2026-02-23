import { prisma } from '../lib/prisma';
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema';

export const productService = {
  async getAllProducts() {
    return await prisma.product.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  },

  async createProduct(data: CreateProductInput) {
    return await prisma.product.create({
      data,
    });
  },

  async updateProduct(id: string, data: UpdateProductInput) {
    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  async deleteProduct(id: string) {
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: id },
    });

    if (hasOrders) {
      throw new Error('Cannot delete product with associated orders');
    }

    return await prisma.product.delete({
      where: { id },
    });
  },

  async checkStock(id: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    });

    if (!product) {
      return false;
    }

    return product.stock >= quantity;
  },
};

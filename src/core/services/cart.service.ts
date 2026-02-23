import { prisma } from '../lib/prisma';

export const cartService = {
  async getCart(userId: string) {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    // Check if product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new Error('Insufficient stock');
      }

      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });
    }

    // Create new cart item
    return await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  },

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    return await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
      },
    });
  },

  async removeFromCart(userId: string, itemId: string) {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  },

  async clearCart(userId: string) {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });
  },
};

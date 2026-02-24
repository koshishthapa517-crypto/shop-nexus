import { prisma } from '../lib/prisma';
import { Prisma } from '@/generated/prisma';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export const orderService = {
  async createOrder(userId: string, items: OrderItemInput[]) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate stock for all items and get product details
      const productDetails = [];
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        productDetails.push({
          ...item,
          price: product.price,
        });
      }

      // 2. Calculate total amount
      const totalAmount = productDetails.reduce(
        (sum, item) => sum.add(new Prisma.Decimal(item.price.toString()).mul(item.quantity)),
        new Prisma.Decimal(0)
      );

      // 3. Create order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
        },
      });

      // 4. Create order items and reduce stock
      for (const item of productDetails) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 5. Clear cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      // Return order with items
      return await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  },

  async getUserOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getAllOrders() {
    return await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async updateOrderStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
};

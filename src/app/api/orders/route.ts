import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { orderService } from '@/core/services/order.service';
import { createOrderSchema } from '@/core/schemas/order.schema';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // If admin, return all orders; otherwise return user's orders
    const orders =
      session.user.role === 'ADMIN'
        ? await orderService.getAllOrders()
        : await orderService.getUserOrders(session.user.id);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items } = validation.data;
    const order = await orderService.createOrder(session.user.id, items);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      // Handle insufficient stock errors
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json(
          { error: 'Bad Request', message: error.message },
          { status: 400 }
        );
      }
      // Handle product not found errors
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Bad Request', message: error.message },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

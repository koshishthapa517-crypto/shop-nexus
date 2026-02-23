import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { cartService } from '@/core/services/cart.service';
import { addToCartSchema } from '@/core/schemas/cart.schema';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const cartItems = await cartService.getCart(session.user.id);
    return NextResponse.json(cartItems, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch cart' },
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
    const validation = addToCartSchema.safeParse(body);

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

    const { productId, quantity } = validation.data;
    const cartItem = await cartService.addToCart(session.user.id, productId, quantity);
    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Insufficient stock') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Insufficient stock available' },
          { status: 409 }
        );
      }
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { error: 'Not Found', message: 'Product not found' },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

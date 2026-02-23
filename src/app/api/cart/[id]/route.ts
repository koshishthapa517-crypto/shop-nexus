import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { cartService } from '@/core/services/cart.service';
import { updateCartItemSchema } from '@/core/schemas/cart.schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);

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

    const { quantity } = validation.data;
    const cartItem = await cartService.updateCartItem(session.user.id, id, quantity);
    return NextResponse.json(cartItem, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Cart item not found') {
        return NextResponse.json(
          { error: 'Not Found', message: 'Cart item not found' },
          { status: 404 }
        );
      }
      if (error.message === 'Insufficient stock') {
        return NextResponse.json(
          { error: 'Conflict', message: 'Insufficient stock available' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    await cartService.removeFromCart(session.user.id, id);
    return NextResponse.json(
      { message: 'Item removed' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Cart item not found') {
      return NextResponse.json(
        { error: 'Not Found', message: 'Cart item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}

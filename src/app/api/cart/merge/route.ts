import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { cartService } from '@/core/services/cart.service';

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
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Items must be an array' },
        { status: 400 }
      );
    }

    // Merge guest cart items with user's cart
    const mergedItems = [];
    
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        continue;
      }

      try {
        const cartItem = await cartService.addToCart(
          session.user.id,
          item.productId,
          item.quantity
        );
        mergedItems.push(cartItem);
      } catch (error) {
        // Skip items that fail (e.g., out of stock, product not found)
        console.error(`Failed to merge item ${item.productId}:`, error);
      }
    }

    return NextResponse.json(
      { 
        message: 'Cart merged successfully',
        mergedCount: mergedItems.length,
        items: mergedItems
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cart merge error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to merge cart' },
      { status: 500 }
    );
  }
}

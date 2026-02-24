import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { prisma } from '@/core/lib/prisma';
import Stripe from 'stripe';

const PAYMENT_MODE = process.env.PAYMENT_MODE || 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { orderId, paymentIntentId } = await request.json();
    console.log('Payment confirm request:', { orderId, paymentIntentId, userId: session.user.id });

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Order ID and payment intent ID are required' },
        { status: 400 }
      );
    }

    let paymentSucceeded = false;
    let paymentMethod = 'card';

    // Mock payment mode
    if (PAYMENT_MODE === 'mock' || paymentIntentId.startsWith('mock_')) {
      console.log('Mock payment mode: Confirming payment for order', orderId);
      paymentSucceeded = true;
      paymentMethod = 'mock_card';
    } else {
      // Real Stripe payment verification
      if (!stripe) {
        console.error('Stripe not configured');
        return NextResponse.json(
          { error: 'Configuration Error', message: 'Stripe is not configured' },
          { status: 500 }
        );
      }

      console.log('Verifying payment with Stripe...');
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentSucceeded = paymentIntent.status === 'succeeded';
      paymentMethod = paymentIntent.payment_method_types[0] || 'card';
      console.log('Stripe verification result:', { status: paymentIntent.status, paymentSucceeded });
    }

    if (paymentSucceeded) {
      console.log('Payment succeeded, updating order...');
      
      // Update order with payment information
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'PROCESSING',
          paymentIntentId,
          paymentMethod,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      console.log('Order updated successfully:', order.id);

      // Clear user's cart after successful payment
      const deletedCount = await prisma.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      console.log('Cart cleared:', deletedCount.count, 'items removed');
      return NextResponse.json({ success: true, order });
    } else {
      console.log('Payment failed');
      // Payment failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'failed',
        },
      });

      return NextResponse.json(
        { error: 'Payment Failed', message: 'Payment was not successful' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to confirm payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { prisma } from '@/core/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

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

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Order ID and payment intent ID are required' },
        { status: 400 }
      );
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order with payment information
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'PROCESSING',
          paymentIntentId,
          paymentMethod: paymentIntent.payment_method_types[0] || 'card',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return NextResponse.json({ success: true, order });
    } else {
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
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

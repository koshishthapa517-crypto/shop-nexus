import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
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
    const { orderId, amount } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Mock payment mode for testing
    if (PAYMENT_MODE === 'mock') {
      console.log('Mock payment mode: Creating mock payment intent');
      return NextResponse.json({
        clientSecret: `mock_secret_${orderId}`,
        paymentIntentId: `mock_pi_${orderId}`,
        mockMode: true,
      });
    }

    // Real Stripe payment
    if (!stripe) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'Stripe is not configured. Set STRIPE_SECRET_KEY or use PAYMENT_MODE=mock' },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
      currency: 'inr',
      metadata: {
        orderId,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

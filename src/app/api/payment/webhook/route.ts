import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            status: 'PROCESSING',
            paymentIntentId: paymentIntent.id,
            paymentMethod: paymentIntent.payment_method_types[0] || 'card',
          },
        });
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      const failedOrderId = failedPayment.metadata.orderId;

      if (failedOrderId) {
        await prisma.order.update({
          where: { id: failedOrderId },
          data: {
            paymentStatus: 'failed',
          },
        });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

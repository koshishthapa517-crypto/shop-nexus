'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

function CheckoutForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      try {
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (res.ok) {
          router.push(`/orders/${orderId}?payment=success`);
        } else {
          setMessage('Payment confirmation failed. Please contact support.');
          setIsLoading(false);
        }
      } catch (err) {
        setMessage('Payment confirmation failed. Please contact support.');
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">Rs. {amount.toFixed(2)}</p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderAndCreateIntent();
  }, [orderId]);

  const fetchOrderAndCreateIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order details
      const orderRes = await fetch(`/api/orders/${orderId}`);
      if (!orderRes.ok) {
        throw new Error('Failed to fetch order');
      }
      const orderData = await orderRes.json();
      setOrder(orderData);

      // Check if already paid
      if (orderData.paymentStatus === 'paid') {
        router.push(`/orders/${orderId}`);
        return;
      }

      // Create payment intent
      const intentRes = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: Number(orderData.totalAmount),
        }),
      });

      if (!intentRes.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await intentRes.json();
      setClientSecret(clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Order not found'}
          </div>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = {
    clientSecret: clientSecret!,
    appearance,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Order #{order.id.slice(0, 8)}</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm orderId={orderId} amount={Number(order.totalAmount)} />
            </Elements>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/orders')}
            className="text-blue-600 hover:text-blue-800"
          >
            Cancel and return to orders
          </button>
        </div>
      </div>
    </div>
  );
}

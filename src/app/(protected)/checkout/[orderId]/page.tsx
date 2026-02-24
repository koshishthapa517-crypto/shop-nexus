'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const PAYMENT_MODE = process.env.NEXT_PUBLIC_PAYMENT_MODE || 'stripe';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

// Mock Payment Form Component
function MockPaymentForm({ orderId, amount }: { orderId: string; amount: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      console.log('Confirming payment for order:', orderId);
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentIntentId: `mock_pi_${orderId}`,
        }),
      });

      const data = await res.json();
      console.log('Payment confirmation response:', res.status, data);

      if (res.ok) {
        console.log('Payment successful, redirecting to order page...');
        // Trigger cart update to clear badge
        window.dispatchEvent(new Event('cartUpdated'));
        router.push(`/orders/${orderId}?payment=success`);
      } else {
        console.error('Payment confirmation failed:', data);
        alert(`Payment confirmation failed: ${data.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      alert('Payment confirmation failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
        <p className="font-medium">Mock Payment Mode</p>
        <p className="text-sm">This is a test payment. Enter any card details.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVC
          </label>
          <input
            type="text"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">Rs. {amount.toFixed(2)}</p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
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
        console.log('Payment succeeded, confirming with backend...');
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const data = await res.json();
        console.log('Payment confirmation response:', res.status, data);

        if (res.ok) {
          console.log('Payment confirmed, redirecting...');
          // Trigger cart update to clear badge
          window.dispatchEvent(new Event('cartUpdated'));
          router.push(`/orders/${orderId}?payment=success`);
        } else {
          console.error('Payment confirmation failed:', data);
          setMessage(`Payment confirmation failed: ${data.message || 'Please contact support.'}`);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Payment confirmation error:', err);
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
    if (orderId) {
      fetchOrderAndCreateIntent();
    }
  }, [orderId]);

  const fetchOrderAndCreateIntent = async () => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

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
          {PAYMENT_MODE === 'mock' ? (
            <MockPaymentForm orderId={orderId} amount={Number(order.totalAmount)} />
          ) : clientSecret && stripePromise ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm orderId={orderId} amount={Number(order.totalAmount)} />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-600">Payment system not configured</p>
            </div>
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

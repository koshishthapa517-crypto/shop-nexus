'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders');
      
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven&apos;t placed any orders yet</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1">
                    Order #{order.id.slice(0, 8)}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-3 md:mt-0">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-green-600">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold text-center ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm font-semibold text-center ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="text-sm bg-gray-100 px-2 py-1 rounded"
                    >
                      {item.product.name} (x{item.quantity})
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-sm text-gray-500 px-2 py-1">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <Link
                href={`/orders/${order.id}`}
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm mr-2"
              >
                View Details
              </Link>
              {order.paymentStatus === 'unpaid' && (
                <Link
                  href={`/checkout/${order.id}`}
                  className="inline-block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm"
                >
                  Pay Now
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

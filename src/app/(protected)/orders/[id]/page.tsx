import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import Link from 'next/link';

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

async function getOrder(id: string): Promise<Order | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders/${id}`, {
    cache: 'no-store',
    headers: {
      Cookie: `next-auth.session-token=${session}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch order');
  }

  return res.json();
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  const calculateItemSubtotal = (item: OrderItem) => {
    return Number(item.price) * item.quantity;
  };

  const getStatusColor = (status: string) => {
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
  };

  const getPaymentStatusColor = (status: string) => {
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus.toUpperCase()}
                </span>
                <span className={`px-4 py-2 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.product.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Quantity: <span className="font-medium">{item.quantity}</span>
                      </span>
                      <span className="text-gray-600">
                        Price: <span className="font-medium">Rs. {Number(item.price).toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                    <p className="text-lg font-bold">
                      Rs. {calculateItemSubtotal(item).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-gray-600">
                Total Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">Order Total</span>
              <span className="text-3xl font-bold text-green-600">
                Rs. {Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            {order.paymentStatus === 'unpaid' && (
              <Link
                href={`/checkout/${order.id}`}
                className="inline-block bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 mr-4"
              >
                Pay Now
              </Link>
            )}
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

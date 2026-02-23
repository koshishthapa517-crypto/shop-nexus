import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/lib/auth';
import { redirect } from 'next/navigation';

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
  status: 'PENDING' | 'PAID';
  createdAt: string;
  items: OrderItem[];
}

async function getOrders(): Promise<Order[]> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders`, {
    cache: 'no-store',
    headers: {
      Cookie: `next-auth.session-token=${session}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }

  return res.json();
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven't placed any orders yet</p>
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
                      ${Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      order.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status}
                  </span>
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
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: string;
}

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch product');
  }

  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">📦</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  Rs. {Number(product.price).toFixed(0)}
                </span>
                {product.stock === 0 ? (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-gray-600">
                    {product.stock} in stock
                  </span>
                )}
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              <div className="mt-auto">
                <AddToCartButton productId={product.id} isOutOfStock={product.stock === 0} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

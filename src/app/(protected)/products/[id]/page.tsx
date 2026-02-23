import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
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
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-green-600">
              ${Number(product.price).toFixed(2)}
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
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
          
          <AddToCartButton productId={product.id} isOutOfStock={product.stock === 0} />
        </div>
      </div>
    </div>
  );
}

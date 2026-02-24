'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { guestCartService } from '@/core/lib/guestCart';

interface AddToCartButtonProps {
  productId: string;
  isOutOfStock: boolean;
}

export default function AddToCartButton({ productId, isOutOfStock }: AddToCartButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!session) {
        // Add to guest cart (localStorage)
        guestCartService.addItem(productId, quantity);
        alert('Product added to cart! Sign in to checkout.');
        router.push('/cart');
        return;
      }

      // Add to user's cart (database)
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }

      alert('Product added to cart successfully!');
      router.push('/cart');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Add to cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
          Quantity:
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={isOutOfStock}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
      >
        {loading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
}

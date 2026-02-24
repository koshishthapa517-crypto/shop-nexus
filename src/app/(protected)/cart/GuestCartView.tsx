'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { guestCartService, GuestCartItem } from '@/core/lib/guestCart';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface GuestCartItemWithProduct extends GuestCartItem {
  product?: Product;
}

export default function GuestCartView() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<GuestCartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGuestCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => loadGuestCart();
    window.addEventListener('guestCartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('guestCartUpdated', handleCartUpdate);
    };
  }, []);

  const loadGuestCart = async () => {
    try {
      setLoading(true);
      const guestItems = guestCartService.getCart();
      
      if (guestItems.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fetch product details for each item
      const itemsWithProducts = await Promise.all(
        guestItems.map(async (item) => {
          try {
            const res = await fetch(`/api/products/${item.productId}`);
            if (res.ok) {
              const product = await res.json();
              return { ...item, product };
            }
          } catch (err) {
            console.error(`Failed to fetch product ${item.productId}:`, err);
          }
          return item;
        })
      );

      setCartItems(itemsWithProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    guestCartService.updateQuantity(productId, newQuantity);
    loadGuestCart();
  };

  const removeItem = (productId: string) => {
    if (!confirm('Remove this item from cart?')) return;
    guestCartService.removeItem(productId);
    loadGuestCart();
  };

  const calculateSubtotal = (item: GuestCartItemWithProduct) => {
    if (!item.product) return 0;
    return Number(item.product.price) * item.quantity;
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const handleCheckout = () => {
    router.push('/login?callbackUrl=/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6">
        <p className="font-medium">Sign in to checkout and save your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => {
              if (!item.product) {
                return (
                  <div key={item.productId} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <p className="text-gray-500">Product not available</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600 hover:text-red-800 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              }

              return (
                <div key={item.productId} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-green-600 font-bold">
                        Rs. {Number(item.product.price).toFixed(2)}
                      </p>
                      {item.product.stock < item.quantity && (
                        <p className="text-red-600 text-sm mt-1">
                          Only {item.product.stock} in stock
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-8 h-8 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                        <p className="text-lg font-bold">
                          Rs. {calculateSubtotal(item).toFixed(2)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 shadow-sm sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartItems.length})</span>
                <span>Rs. {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">
                  Rs. {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Sign In to Checkout
            </button>
            
            <button
              onClick={() => router.push('/products')}
              className="w-full mt-3 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

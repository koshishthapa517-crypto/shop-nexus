'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingCart, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { guestCartService } from '@/core/lib/guestCart';

export default function Navigation() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update cart count
    const updateCartCount = async () => {
      if (session) {
        // Fetch authenticated user's cart count
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const items = await res.json();
            setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
          }
        } catch (error) {
          console.error('Failed to fetch cart count:', error);
        }
      } else {
        // Get guest cart count from localStorage
        setCartCount(guestCartService.getItemCount());
      }
    };

    updateCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('guestCartUpdated', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('guestCartUpdated', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/products';
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            ShopNexus
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-900 hover:text-black font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-900 hover:text-black font-medium">
              Products
            </Link>
            <Link href="/about" className="text-gray-900 hover:text-black font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-900 hover:text-black font-medium">
              Contact
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-r-md hover:bg-gray-800 font-medium"
            >
              Search
            </button>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session ? (
              <>
                <Link href="/cart" className="text-gray-900 hover:text-black relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-900 hover:text-black focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-medium">{session.user.name}</span>
                    <ChevronDown size={16} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-600">{session.user.email}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {session.user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                        </p>
                      </div>
                      
                      {session.user.role === 'ADMIN' && (
                        <>
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/products"
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Manage Products
                          </Link>
                          <Link
                            href="/admin/orders"
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Manage Orders
                          </Link>
                          <div className="border-t border-gray-200 my-2"></div>
                        </>
                      )}
                      
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/cart"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Cart
                      </Link>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/cart" className="text-gray-900 hover:text-black relative">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-black border border-gray-300 rounded-md"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

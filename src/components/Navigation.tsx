'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Bell, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const [searchQuery, setSearchQuery] = useState('');

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
                <button className="text-gray-900 hover:text-black">
                  <Bell size={20} />
                </button>
                <Link href="/cart" className="text-gray-900 hover:text-black">
                  <ShoppingCart size={20} />
                </Link>
                <span className="text-sm text-gray-900">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-gray-900 hover:text-black"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
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

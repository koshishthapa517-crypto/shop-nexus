'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  createdAt?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
    
    // Get search query from URL
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/products');
      
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price
    if (minPrice) {
      filtered = filtered.filter(p => Number(p.price) >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => Number(p.price) <= Number(maxPrice));
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    setFilteredProducts(filtered);
  };

  const handleApplyFilters = () => {
    applyFiltersAndSearch();
  };

  const handleResetFilters = () => {
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('all');
    setSortBy('newest');
    setSearchQuery('');
    
    // Clear URL search params
    window.history.pushState({}, '', '/products');
    
    setFilteredProducts(products);
  };

  const getProductRating = () => {
    return (Math.random() * 2 + 3).toFixed(1);
  };

  const getProductReviews = () => {
    return Math.floor(Math.random() * 1000 + 100);
  };

  // Product images - realistic product photos
  const productImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
  ];

  const getProductImage = (index: number) => {
    return productImages[index % productImages.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">All Products</h1>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">All Products</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={fetchProducts}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">All Products</h1>
        {searchQuery && (
          <p className="text-sm text-gray-700 mb-2">
            Search results for: <span className="font-semibold">"{searchQuery}"</span>
          </p>
        )}
        <p className="text-sm text-gray-700 mb-6">{filteredProducts.length} products found</p>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-base font-bold mb-6 text-gray-900">Filters</h2>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Categories</option>
                  <option value="clothing">Clothing</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              {/* Min Price */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Min Price
                </label>
                <input
                  type="text"
                  placeholder="Rs. 500"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Max Price */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Max Price
                </label>
                <input
                  type="text"
                  placeholder="Rs. 15000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Min Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4★ & above</option>
                  <option value="3">3★ & above</option>
                  <option value="2">2★ & above</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 font-medium text-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 px-4 rounded-md hover:bg-gray-300 font-medium text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort By */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-900">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product, index) => {
                  const rating = getProductRating();
                  const reviews = getProductReviews();
                  
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <Link href={`/products/${product.id}`}>
                        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img 
                            src={product.image || getProductImage(index)}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.src = getProductImage(index);
                            }}
                          />
                        </div>
                      </Link>
                      <div className="p-3">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 text-sm">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="text-yellow-500 fill-yellow-500" size={12} />
                          <span className="text-xs font-semibold text-gray-900">{rating}</span>
                          <span className="text-xs text-gray-700">({reviews} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            Rs. {Number(product.price).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

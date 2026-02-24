'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, TrendingUp, IndianRupee } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);

      const products = await productsRes.json();
      const orders = await ordersRes.json();

      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${stats.totalRevenue.toFixed(2)}`,
      icon: IndianRupee,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
        <p className="text-gray-700 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-semibold mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center font-extrabold text-base"
            >
              Create New Product
            </Link>
            <Link
              href="/admin/products"
              className="block w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 text-center font-extrabold text-base"
            >
              Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="block w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 text-center font-extrabold text-base"
            >
              View All Orders
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-800 font-semibold">Active Products</span>
              <span className="font-bold text-gray-900">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-800 font-semibold">Completed Orders</span>
              <span className="font-bold text-gray-900">{stats.totalOrders - stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-800 font-semibold">Pending Orders</span>
              <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-800 font-semibold">Average Order Value</span>
              <span className="font-bold text-green-600">
                Rs. {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.link}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.color} p-4 rounded-xl shadow-lg`}>
                    <Icon className="text-white" size={28} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/products/new"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 text-center font-semibold shadow-md hover:shadow-lg transition-all"
              >
                + Create New Product
              </Link>
              <Link
                href="/admin/products"
                className="block w-full bg-gray-50 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-100 text-center font-semibold border border-gray-200 transition-all"
              >
                Manage Products
              </Link>
              <Link
                href="/admin/orders"
                className="block w-full bg-gray-50 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-100 text-center font-semibold border border-gray-200 transition-all"
              >
                View All Orders
              </Link>
            </div>
          </div>

          {/* System Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center">
              <span className="w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
              System Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-900 font-semibold">Active Products</span>
                    <span className="text-2xl font-bold text-blue-700">{stats.totalProducts}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-green-900 font-semibold">Completed Orders</span>
                    <span className="text-2xl font-bold text-green-700">{stats.totalOrders - stats.pendingOrders}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-900 font-semibold">Pending Orders</span>
                    <span className="text-2xl font-bold text-yellow-700">{stats.pendingOrders}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-900 font-semibold text-sm">Avg Order Value</span>
                    <span className="text-2xl font-bold text-purple-700">
                      Rs. {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

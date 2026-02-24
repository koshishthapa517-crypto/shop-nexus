import Link from 'next/link';
import { Star, Shield, Zap, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white py-32 px-4">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to ShopNexus
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white">
            Your ultimate e-commerce destination for quality products
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Why Choose ShopNexus?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Star className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Quality Products</h3>
              <p className="text-gray-800">
                Curated selection of premium products that meet the highest standards
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Zap className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-800">
                Lightning-fast shipping to get your products to you quickly
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Shield className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Payment</h3>
              <p className="text-gray-800">
                Your transactions are protected with industry-leading security
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MessageCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">24/7 Support</h3>
              <p className="text-gray-800">
                Our dedicated team is always here to help you with any questions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Join thousands of satisfied customers and discover amazing products today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/products"
              className="bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">ShopNexus</h3>
          <p className="text-gray-400 mb-6">
            Your trusted e-commerce partner
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
          <p className="text-gray-500 mt-8">
            © 2026 ShopNexus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

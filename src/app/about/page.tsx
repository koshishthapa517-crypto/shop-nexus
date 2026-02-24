export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-red-500">
            About ShopNexus
          </h1>
          <p className="text-lg text-red-400">
            Your trusted online marketplace since 2024
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Our Story
          </h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              ShopNexus was founded with a vision to revolutionize online shopping in Nepal. We believe that 
              everyone deserves access to quality products at fair prices, delivered with exceptional service and 
              reliability.
            </p>
            
            <p>
              Our journey began with a simple mission: to create a trusted e-commerce platform that connects 
              customers with the best products across electronics, accessories, home office essentials, and more. We 
              work with verified sellers and brands to ensure authenticity and quality in every purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Quality First</h3>
              <p className="text-gray-700">
                We carefully curate our product selection to ensure only the highest quality items reach our customers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Customer Trust</h3>
              <p className="text-gray-700">
                Building lasting relationships with our customers through transparency and exceptional service.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-700">
                We understand your time is valuable. That's why we ensure quick and reliable delivery on all orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Our Mission
          </h2>
          
          <div className="text-center text-gray-700 leading-relaxed">
            <p className="text-lg">
              To provide a seamless online shopping experience that combines quality products, 
              competitive prices, and outstanding customer service. We strive to be Nepal's most 
              trusted e-commerce platform, making online shopping accessible, reliable, and enjoyable 
              for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg mb-8">
            Explore our wide range of products and experience the ShopNexus difference today.
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </section>
    </div>
  );
}

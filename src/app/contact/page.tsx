'use client';

import { useState } from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ fullName: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-orange-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-lg">
            We'd love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Contact Information
              </h2>
              <p className="text-gray-700 mb-8">
                Have questions about our products or services? Reach out to us and we'll 
                respond as soon as possible.
              </p>

              <div className="space-y-6">
                {/* Visit Us */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-gray-700">Lalitpur, Prabaha</p>
                    <p className="text-gray-700">Nepal</p>
                  </div>
                </div>

                {/* Email Us */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                    <p className="text-gray-700">info@shopnexus.com</p>
                    <p className="text-gray-700">support@shopnexus.com</p>
                  </div>
                </div>

                {/* Call Us */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                    <p className="text-gray-700">+977 1234567890</p>
                    <p className="text-gray-700">Mon-Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="product">Product Question</option>
                    <option value="order">Order Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 font-semibold text-lg transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Find Us Here
          </h2>
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Map placeholder - Lalitpur, Prabaha, Nepal</p>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      let imageUrl = formData.image;

      // Upload image if file is selected
      if (imageFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.message || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
        setUploading(false);
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10),
          image: imageUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.details) {
          setErrors(data.details);
        } else {
          setGeneralError(data.message || 'Failed to create product');
        }
        return;
      }

      router.push('/admin/products');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Products
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900">Create New Product</h1>
      </div>

      {generalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="image" className="block text-sm font-bold text-gray-900 mb-2">
            Product Image *
          </label>
          <input
            type="file"
            id="image"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <p className="text-xs text-gray-600 mt-1">
            Accepted formats: JPEG, PNG, WebP, GIF (Max 5MB)
          </p>
          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.join(', ')}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.join(', ')}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="price" className="block text-sm font-bold text-gray-900 mb-2">
              Price (Rs.) *
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.join(', ')}</p>
            )}
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-bold text-gray-900 mb-2">
              Stock *
            </label>
            <input
              type="number"
              id="stock"
              value={formData.stock}
              onChange={(e) => handleChange('stock', e.target.value)}
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock.join(', ')}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {uploading ? 'Uploading Image...' : submitting ? 'Creating...' : 'Create Product'}
          </button>
          <Link
            href="/admin/products"
            className="flex-1 text-center border border-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

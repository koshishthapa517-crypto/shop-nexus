'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      console.log('Submitting registration...');
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Registration response:', response.status, data);

      if (!response.ok) {
        if (data.details) {
          // Validation errors
          const errorMap: Record<string, string> = {};
          Object.keys(data.details).forEach((key) => {
            errorMap[key] = data.details[key][0];
          });
          setErrors(errorMap);
        } else {
          // General error
          setErrors({ general: data.message || 'Registration failed' });
        }
        setIsLoading(false);
        return;
      }

      // Success - auto login
      console.log('Registration successful, attempting auto-login...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('Auto-login result:', result);

      if (result?.ok) {
        // Fetch session to get user role
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        // Redirect based on role if no callback URL
        if (callbackUrl) {
          console.log('Redirecting to callback URL:', callbackUrl);
          router.push(callbackUrl);
        } else if (session?.user?.role === 'ADMIN') {
          console.log('Admin user, redirecting to admin dashboard');
          router.push('/admin');
        } else {
          console.log('Regular user, redirecting to products');
          router.push('/products');
        }
        
        router.refresh();
      } else {
        // If auto-login fails, redirect to login page
        console.log('Auto-login failed, redirecting to login page');
        const redirectUrl = callbackUrl || (data.role === 'ADMIN' ? '/admin' : '/products');
        router.push(`/login?callbackUrl=${encodeURIComponent(redirectUrl)}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ general: 'An unexpected error occurred' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <a 
              href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

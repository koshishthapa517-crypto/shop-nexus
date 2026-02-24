import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Check if user is authenticated for protected routes (cart, orders)
  if (pathname.startsWith('/cart') || pathname.startsWith('/orders')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (token.role !== 'ADMIN') {
      // Redirect non-admin users to products page
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  // Redirect admin users to admin panel from protected routes (except products)
  if (token && token.role === 'ADMIN' && !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/products')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/products/:path*', '/cart/:path*', '/orders/:path*', '/admin/:path*'],
};

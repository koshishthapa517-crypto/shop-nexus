import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Check if user is authenticated
  if (!token) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect admin users to admin panel from protected routes
  if (token.role === 'ADMIN' && !pathname.startsWith('/admin')) {
    // Allow access to API routes
    if (!pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Check admin routes
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'ADMIN') {
      // Redirect non-admin users to products page
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/products/:path*', '/cart/:path*', '/orders/:path*', '/admin/:path*'],
};

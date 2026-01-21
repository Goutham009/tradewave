import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Protect buyer routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/requirements') || 
        pathname.startsWith('/quotations') || pathname.startsWith('/transactions') ||
        pathname.startsWith('/payments') || pathname.startsWith('/blockchain') ||
        pathname.startsWith('/account')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      if (token.role !== 'BUYER' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Protect admin routes (except login page)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public routes
        if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/admin/login') {
          return true;
        }
        
        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/requirements/:path*',
    '/quotations/:path*',
    '/transactions/:path*',
    '/payments/:path*',
    '/blockchain/:path*',
    '/account/:path*',
    '/admin/:path*',
  ],
};

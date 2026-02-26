import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as string | undefined;
    const isInternalOpsRole = ['ACCOUNT_MANAGER', 'PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM'].includes(role || '');

    // Protect buyer routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/requirements') || 
        pathname.startsWith('/quotations') || pathname.startsWith('/transactions') ||
        pathname.startsWith('/payments') || pathname.startsWith('/blockchain') ||
        pathname.startsWith('/account')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }

      if (isInternalOpsRole) {
        return NextResponse.redirect(new URL('/internal', req.url));
      }

      if (role !== 'BUYER' && role !== 'SUPPLIER') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Protect internal employee routes (AM + Procurement)
    if (pathname.startsWith('/internal')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }

      if (!isInternalOpsRole) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect admin routes (except login page)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
      if (role !== 'ADMIN') {
        if (isInternalOpsRole) {
          return NextResponse.redirect(new URL('/internal', req.url));
        }

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
    '/internal/:path*',
    '/requirements/:path*',
    '/quotations/:path*',
    '/transactions/:path*',
    '/payments/:path*',
    '/blockchain/:path*',
    '/account/:path*',
    '/admin/:path*',
  ],
};

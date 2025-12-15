import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-primary">T</span>
            </div>
            <span className="text-2xl font-bold text-white">Tradewave</span>
          </Link>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white">
            Transform Your B2B Trade Experience
          </h1>
          <p className="text-lg text-white/80">
            Secure escrow payments, blockchain verification, and a curated network of verified suppliers - all in one platform.
          </p>
          <div className="flex items-center gap-8 text-white/80">
            <div>
              <div className="text-3xl font-bold text-white">$2.5B+</div>
              <div className="text-sm">Trade Volume</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm">Active Buyers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">45+</div>
              <div className="text-sm">Countries</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} Tradewave. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

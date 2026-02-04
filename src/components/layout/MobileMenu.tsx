'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, FileText, Package, CreditCard, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Browse', href: '/requirements', icon: FileText },
  { name: 'Dashboard', href: '/dashboard', icon: Package },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Profile', href: '/profile', icon: User },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-brand-textDark" />
        ) : (
          <Menu className="h-5 w-5 text-brand-textDark" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent">
                  <span className="text-sm font-bold text-white">T</span>
                </div>
                <span className="text-lg font-bold text-brand-textDark">Tradewave</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-brand-textMedium" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                          isActive
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'text-brand-textMedium hover:bg-slate-50 hover:text-brand-textDark'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Auth Buttons */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4 space-y-3">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button variant="gradient" className="w-full justify-center">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

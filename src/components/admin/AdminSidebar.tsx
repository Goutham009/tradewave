'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Activity,
  FileText,
  Settings,
  Shield,
  Package,
  Truck,
  Building2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
  { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { name: 'Requirements', href: '/admin/requirements', icon: Package },
  { name: 'Shipments', href: '/admin/shipments', icon: Truck },
  { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'System', href: '/admin/system', icon: Activity },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Security', href: '/admin/security', icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-700 bg-slate-900 lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-700 px-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-red-600/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-6">
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Settings
            </div>
            <div className="mt-2 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-red-600/20 text-red-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4">
          <Link href="/dashboard">
            <div className="rounded-lg bg-slate-800 p-3 text-center text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
              ← Back to Platform
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}

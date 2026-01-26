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
  FileCheck,
  Mail,
  Star,
  Crown,
  RefreshCw,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
  { name: 'KYB Verification', href: '/admin/kyb', icon: Shield },
  { name: 'Trust & Blacklist', href: '/admin/trust', icon: Shield },
  { name: 'Loyalty Program', href: '/admin/loyalty', icon: Crown },
  { name: 'Repeat Buyers', href: '/admin/repeat-buyers', icon: RefreshCw },
  { name: 'RFQs & Quotes', href: '/admin/rfq', icon: FileCheck },
  { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { name: 'Requirements', href: '/admin/requirements', icon: Package },
  { name: 'Shipments', href: '/admin/shipments', icon: Truck },
  { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Emails', href: '/admin/emails/logs', icon: Mail },
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
    <aside className="hidden w-72 flex-shrink-0 border-r border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-18 items-center border-b border-slate-800 px-6 py-5">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <p className="text-xs text-slate-500">Tradewave Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-red-500/20 to-rose-500/10 text-red-400 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-red-400")} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-8">
            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
              Settings
            </div>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-red-500/20 to-rose-500/10 text-red-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-red-400")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <Link href="/dashboard">
            <div className="rounded-xl bg-slate-800/50 p-4 text-center text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 border border-slate-700/50">
              ← Back to Platform
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}

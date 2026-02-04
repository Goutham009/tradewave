'use client';

import React, { useState } from 'react';
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
  TrendingUp,
  DollarSign,
  UserCheck,
  UserX,
  Star,
  Briefcase,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavSection {
  title: string;
  items: { name: string; href: string; icon: any }[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'User Management',
    items: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'KYB Verification', href: '/admin/kyb', icon: Shield },
    ],
  },
  {
    title: 'Buyer Management',
    items: [
      { name: 'Buyer Analytics', href: '/admin/buyers/analytics', icon: BarChart3 },
      { name: 'Top Performers', href: '/admin/buyers/top-performers', icon: Star },
      { name: 'At Risk Buyers', href: '/admin/buyers/at-risk', icon: UserX },
      { name: 'Buyer Payout', href: '/admin/buyers/payout', icon: DollarSign },
    ],
  },
  {
    title: 'Supplier Management',
    items: [
      { name: 'All Suppliers', href: '/admin/suppliers', icon: Building2 },
      { name: 'Supplier Analytics', href: '/admin/suppliers/analytics', icon: BarChart3 },
      { name: 'Top Performers', href: '/admin/suppliers/top-performers', icon: Star },
      { name: 'At Risk Suppliers', href: '/admin/suppliers/at-risk', icon: UserX },
      { name: 'Supplier Payout', href: '/admin/suppliers/payout', icon: DollarSign },
    ],
  },
  {
    title: 'Account Managers',
    items: [
      { name: 'All Managers', href: '/admin/account-managers', icon: Briefcase },
      { name: 'Manager Analytics', href: '/admin/account-managers/analytics', icon: BarChart3 },
      { name: 'Top Performers', href: '/admin/account-managers/top-performers', icon: Star },
      { name: 'Manager Payout', href: '/admin/account-managers/payout', icon: DollarSign },
    ],
  },
  {
    title: 'Order Management',
    items: [
      { name: 'Requirements', href: '/admin/requirements', icon: Package },
      { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
      { name: 'Shipments', href: '/admin/shipments', icon: Truck },
      { name: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    ],
  },
  {
    title: 'Analytics & Reports',
    items: [
      { name: 'Platform Analytics', href: '/admin/analytics', icon: TrendingUp },
      { name: 'Reports', href: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'System Health', href: '/admin/system', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
      { name: 'Security', href: '/admin/security', icon: Shield },
    ],
  },
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
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {section.title !== 'Overview' && (
                  <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin' && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-red-500/20 to-rose-500/10 text-red-400'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", isActive && "text-red-400")} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
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

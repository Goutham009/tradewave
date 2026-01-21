'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  CreditCard,
  Package,
  Truck,
  ClipboardList,
  Settings,
  HelpCircle,
  Link as LinkIcon,
  Shield,
  Users,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Requirements', href: '/requirements', icon: FileText },
  { name: 'Quotations', href: '/quotations', icon: MessageSquare },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Transactions', href: '/transactions', icon: Package },
  { name: 'Shipments', href: '/shipments', icon: Truck },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Blockchain', href: '/blockchain', icon: LinkIcon },
];

const secondaryNavigation = [
  { name: 'Account', href: '/account', icon: Users },
  { name: 'Security', href: '/account/security', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-background lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <span className="text-xl font-bold">Tradewave</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="my-4 border-t" />

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-primary/5 p-4">
            <h4 className="text-sm font-semibold">Need Help?</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Contact your account manager or visit our help center.
            </p>
            <Link
              href="/help"
              className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            >
              Get Support →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

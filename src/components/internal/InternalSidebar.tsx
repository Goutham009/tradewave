'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Package,
  Search,
  Building2,
  BarChart3,
  FileText,
  MessageSquare,
  TrendingUp,
  LogOut,
  Briefcase,
  UserCheck,
  Truck,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// Account Manager navigation
const amNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/internal', icon: LayoutDashboard },
    ],
  },
  {
    title: 'My Work',
    items: [
      { name: 'Verification Queue', href: '/internal/verification', icon: ClipboardCheck },
      { name: 'My Clients', href: '/internal/clients', icon: Users },
      { name: 'Leads', href: '/internal/leads', icon: UserCheck },
    ],
  },
  {
    title: 'Orders',
    items: [
      { name: 'Active Orders', href: '/internal/orders/active', icon: Truck },
      { name: 'Order History', href: '/internal/orders/history', icon: History },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Negotiations', href: '/internal/negotiations', icon: MessageSquare },
      { name: 'Notes & History', href: '/internal/notes', icon: FileText },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { name: 'My Performance', href: '/internal/performance', icon: BarChart3 },
    ],
  },
];

// Procurement Officer navigation
const procurementNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/internal', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Supplier Matching',
    items: [
      { name: 'Requirements Queue', href: '/internal/requirements', icon: Package },
      { name: 'Quotation Review', href: '/internal/quotations', icon: FileText },
    ],
  },
  {
    title: 'Suppliers',
    items: [
      { name: 'All Suppliers', href: '/internal/suppliers', icon: Building2 },
      { name: 'Supplier Analytics', href: '/internal/supplier-analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Notes & History', href: '/internal/procurement-notes', icon: FileText },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Procurement Analytics', href: '/internal/analytics', icon: TrendingUp },
    ],
  },
];

interface InternalSidebarProps {
  userRole: string;
  userName: string;
}

export function InternalSidebar({ userRole, userName }: InternalSidebarProps) {
  const pathname = usePathname();
  
  const isAM = userRole === 'ACCOUNT_MANAGER';
  const navSections = isAM ? amNavSections : procurementNavSections;
  const panelTitle = isAM ? 'Account Manager' : 'Procurement';
  const PanelIcon = isAM ? Briefcase : Package;

  return (
    <aside className="hidden w-72 flex-shrink-0 border-r border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 lg:block">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-18 items-center border-b border-slate-800 px-6 py-5">
          <Link href="/internal" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <PanelIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">{panelTitle}</span>
              <p className="text-xs text-slate-500">Tradewave Internal</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-slate-500">{isAM ? 'Account Manager' : 'Procurement Officer'}</p>
            </div>
          </div>
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
                      (item.href !== '/internal' && pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 text-blue-400'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive && "text-blue-400")} />
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
        <div className="border-t border-slate-800 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}

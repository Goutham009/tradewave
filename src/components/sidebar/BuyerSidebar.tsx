'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  FileText,
  Heart,
  Building2,
  Package,
  ClipboardList,
  Truck,
  RotateCcw,
  Users,
  Star,
  Shield,
  MessageSquare,
  CreditCard,
  Wallet,
  Gift,
  Building,
  Settings,
  DollarSign,
  BarChart3,
  TrendingUp,
  PieChart,
  Blocks,
  Smartphone,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSection } from './SidebarSection';
import { NavItem } from './NavItem';

interface BuyerSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export function BuyerSidebar({ 
  isCollapsed = false, 
  onToggleCollapse,
  onCloseMobile 
}: BuyerSidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800">
      {/* Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white">Tradewave</span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard - No submenu */}
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/dashboard"
          isCollapsed={isCollapsed}
          onClick={handleNavClick}
        />

        {/* Procurement Section */}
        <SidebarSection
          id="procurement"
          title="Procurement"
          icon={Search}
          defaultExpanded={true}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={FileText} label="My RFQs" href="/rfq" badge={4} onClick={handleNavClick} />
          <NavItem icon={Search} label="Discover RFQs" href="/seller/rfq" onClick={handleNavClick} />
          <NavItem icon={Heart} label="Saved Quotes" href="/buyer/saved-quotes" onClick={handleNavClick} />
          <NavItem icon={Star} label="Favorite Suppliers" href="/buyer/favorites" onClick={handleNavClick} />
          <NavItem icon={Building2} label="Discover Suppliers" href="/suppliers" onClick={handleNavClick} />
        </SidebarSection>

        {/* Orders & Fulfillment Section */}
        <SidebarSection
          id="orders"
          title="Orders & Fulfillment"
          icon={Package}
          defaultExpanded={true}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={ClipboardList} label="Active Orders" href="/transactions" badge={3} onClick={handleNavClick} />
          <NavItem icon={Package} label="Order History" href="/buyer/history" onClick={handleNavClick} />
          <NavItem icon={Truck} label="Track Shipments" href="/shipments" onClick={handleNavClick} />
          <NavItem icon={RotateCcw} label="Returns & Claims" href="/returns" onClick={handleNavClick} />
        </SidebarSection>

        {/* Relationships Section */}
        <SidebarSection
          id="relationships"
          title="Relationships"
          icon={Users}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Star} label="Supplier Reviews" href="/reviews" onClick={handleNavClick} />
          <NavItem icon={Shield} label="Supplier Trust" href="/seller/trust" onClick={handleNavClick} />
          <NavItem icon={MessageSquare} label="Messages" href="/messages" badge="3 New" badgeVariant="success" onClick={handleNavClick} />
        </SidebarSection>

        {/* Account & Billing Section */}
        <SidebarSection
          id="account"
          title="Account & Billing"
          icon={CreditCard}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Wallet} label="Payment Methods" href="/payments" onClick={handleNavClick} />
          <NavItem icon={CreditCard} label="Billing History" href="/billing" onClick={handleNavClick} />
          <NavItem icon={Gift} label="Referral Program" href="/referrals" onClick={handleNavClick} />
          <NavItem icon={Building} label="Company Info" href="/profile" onClick={handleNavClick} />
          <NavItem icon={Shield} label="KYB Verification" href="/kyb/status" onClick={handleNavClick} />
          <NavItem icon={DollarSign} label="Earnings" href="/earnings" onClick={handleNavClick} />
        </SidebarSection>

        {/* Analytics & Insights Section */}
        <SidebarSection
          id="analytics"
          title="Analytics & Insights"
          icon={BarChart3}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={TrendingUp} label="Spending Trends" href="/buyer/analytics" onClick={handleNavClick} />
          <NavItem icon={PieChart} label="Supplier Analysis" href="/buyer/analytics/suppliers" onClick={handleNavClick} />
        </SidebarSection>

        {/* Integrations Section */}
        <SidebarSection
          id="integrations"
          title="Integrations"
          icon={Puzzle}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Smartphone} label="Mobile App" href="/mobile" onClick={handleNavClick} />
          <NavItem icon={Puzzle} label="Connected Apps" href="/apps" onClick={handleNavClick} />
        </SidebarSection>

        {/* Blockchain - Separate */}
        <NavItem
          icon={Blocks}
          label="Blockchain"
          href="/blockchain"
          isCollapsed={isCollapsed}
          onClick={handleNavClick}
        />

        {/* Settings - Separate Section */}
        <NavItem
          icon={Settings}
          label="Settings"
          href="/settings"
          isCollapsed={isCollapsed}
          onClick={handleNavClick}
        />
      </nav>

      {/* Collapse Toggle (Desktop) */}
      {onToggleCollapse && (
        <div className="hidden lg:flex p-3 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
              'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

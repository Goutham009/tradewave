'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Shield,
  AlertTriangle,
  Package,
  ClipboardList,
  Truck,
  MessageSquare,
  CreditCard,
  Building2,
  BarChart3,
  TrendingUp,
  Star,
  Megaphone,
  FileText,
  Mail,
  Lock,
  Activity,
  Settings,
  Wallet,
  Globe,
  Target,
  Search,
  AlertCircle,
  Eye,
  Crown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Gavel,
  MapPin,
  Webhook,
  Key,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarSection } from './SidebarSection';
import { NavItem } from './NavItem';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile
}: AdminSidebarProps) {
  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <p className="text-xs text-slate-500">Tradewave</p>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/admin"
          isCollapsed={isCollapsed}
          onClick={handleNavClick}
        />

        {/* Lead Management */}
        <NavItem
          icon={Target}
          label="Leads"
          href="/admin/leads"
          badge={3}
          badgeVariant="warning"
          isCollapsed={isCollapsed}
          onClick={handleNavClick}
        />

        {/* User Management */}
        <SidebarSection
          id="users"
          title="User Management"
          icon={Users}
          defaultExpanded={true}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Users} label="All Users" href="/admin/users" onClick={handleNavClick} />
          <NavItem icon={UserCheck} label="KYB Reviews" href="/admin/kyb" badge={5} badgeVariant="warning" onClick={handleNavClick} />
          <NavItem icon={Shield} label="Trust & Blacklist" href="/admin/trust" onClick={handleNavClick} />
          <NavItem icon={AlertTriangle} label="Appeals Review" href="/admin/appeals" badge={2} onClick={handleNavClick} />
        </SidebarSection>

        {/* Order Management */}
        <SidebarSection
          id="orders"
          title="Order Management"
          icon={Package}
          defaultExpanded={true}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={ClipboardList} label="Requirements" href="/admin/requirements" badge={5} badgeVariant="warning" onClick={handleNavClick} />
          <NavItem icon={FileText} label="Quotations" href="/admin/quotations" badge={8} onClick={handleNavClick} />
          <NavItem icon={Package} label="All Orders" href="/admin/transactions" onClick={handleNavClick} />
          <NavItem icon={Truck} label="Shipments" href="/admin/shipments" onClick={handleNavClick} />
          <NavItem icon={MessageSquare} label="Disputes" href="/admin/disputes" badge={3} badgeVariant="critical" onClick={handleNavClick} />
          <NavItem icon={CreditCard} label="Payments" href="/admin/payments" onClick={handleNavClick} />
        </SidebarSection>

        {/* Account Managers - CONCIERGE WORKFLOW */}
        <SidebarSection
          id="account-managers"
          title="Account Managers"
          icon={UserCog}
          defaultExpanded={true}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={ClipboardList} label="Verification Queue" href="/admin/account-manager" badge={3} badgeVariant="warning" onClick={handleNavClick} />
          <NavItem icon={Users} label="All Managers" href="/admin/account-managers" onClick={handleNavClick} />
          <NavItem icon={BarChart3} label="Manager Analytics" href="/admin/account-managers/analytics" onClick={handleNavClick} />
        </SidebarSection>

        {/* Procurement Team - CONCIERGE WORKFLOW */}
        <SidebarSection
          id="procurement"
          title="Procurement Team"
          icon={Search}
          defaultExpanded={true}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={ClipboardList} label="Matching Queue" href="/admin/procurement" badge={2} badgeVariant="warning" onClick={handleNavClick} />
          <NavItem icon={BarChart3} label="Procurement Analytics" href="/admin/procurement/analytics" onClick={handleNavClick} />
        </SidebarSection>

        {/* Buyer Management */}
        <SidebarSection
          id="buyers"
          title="Buyer Management"
          icon={Crown}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={BarChart3} label="Buyer Analytics" href="/admin/buyers/analytics" onClick={handleNavClick} />
          <NavItem icon={Star} label="Top Performers" href="/admin/buyers/top-performers" onClick={handleNavClick} />
          <NavItem icon={AlertTriangle} label="At Risk Buyers" href="/admin/buyers/at-risk" badge={2} badgeVariant="warning" onClick={handleNavClick} />
        </SidebarSection>

        {/* Supplier Management */}
        <SidebarSection
          id="suppliers"
          title="Supplier Management"
          icon={Building2}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Building2} label="All Suppliers" href="/admin/suppliers" onClick={handleNavClick} />
          <NavItem icon={BarChart3} label="Supplier Analytics" href="/admin/suppliers/analytics" onClick={handleNavClick} />
          <NavItem icon={Star} label="Top Performers" href="/admin/suppliers/top-performers" onClick={handleNavClick} />
          <NavItem icon={AlertTriangle} label="At Risk Suppliers" href="/admin/suppliers/at-risk" badge={2} badgeVariant="warning" onClick={handleNavClick} />
        </SidebarSection>

        {/* Platform Content */}
        <SidebarSection
          id="content"
          title="Platform Content"
          icon={Megaphone}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Megaphone} label="Promotions" href="/admin/promotions" onClick={handleNavClick} />
          <NavItem icon={FileText} label="Help Articles" href="/admin/content/help" onClick={handleNavClick} />
          <NavItem icon={Mail} label="Email Templates" href="/admin/emails/templates" onClick={handleNavClick} />
        </SidebarSection>

        {/* Analytics & Reports */}
        <SidebarSection
          id="analytics"
          title="Analytics & Reports"
          icon={BarChart3}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={TrendingUp} label="GMV & Revenue" href="/admin/analytics" onClick={handleNavClick} />
          <NavItem icon={Users} label="User Growth" href="/admin/analytics/users" onClick={handleNavClick} />
          <NavItem icon={Target} label="Funnel Analytics" href="/admin/analytics/funnel" onClick={handleNavClick} />
          <NavItem icon={MapPin} label="Geographic Analysis" href="/admin/analytics/geo" onClick={handleNavClick} />
          <NavItem icon={FileText} label="Custom Reports" href="/admin/reports" onClick={handleNavClick} />
        </SidebarSection>

        {/* Security & Compliance */}
        <SidebarSection
          id="security"
          title="Security & Compliance"
          icon={Lock}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Activity} label="Audit Logs" href="/admin/security/logs" onClick={handleNavClick} />
          <NavItem icon={Key} label="API Keys" href="/admin/security/api-keys" onClick={handleNavClick} />
          <NavItem icon={FileText} label="Compliance" href="/admin/compliance" onClick={handleNavClick} />
          <NavItem icon={AlertTriangle} label="Fraud Detection" href="/admin/fraud" badge={1} badgeVariant="critical" onClick={handleNavClick} />
        </SidebarSection>

        {/* System Configuration */}
        <SidebarSection
          id="system"
          title="System Configuration"
          icon={Settings}
          defaultExpanded={false}
          isCollapsed={isCollapsed}
        >
          <NavItem icon={Settings} label="General Settings" href="/admin/settings" onClick={handleNavClick} />
          <NavItem icon={Globe} label="Regions & Currency" href="/admin/settings/regions" onClick={handleNavClick} />
          <NavItem icon={CreditCard} label="Payment Gateway" href="/admin/settings/payments" onClick={handleNavClick} />
          <NavItem icon={Mail} label="Email Config" href="/admin/emails/logs" onClick={handleNavClick} />
          <NavItem icon={Webhook} label="Webhooks" href="/admin/webhooks" onClick={handleNavClick} />
          <NavItem icon={Activity} label="System Health" href="/admin/system" onClick={handleNavClick} />
          <NavItem icon={UserCog} label="Admin Team" href="/admin/team" onClick={handleNavClick} />
        </SidebarSection>
      </nav>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <div className="hidden lg:flex p-3 border-t border-slate-800">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
              'text-slate-400 hover:bg-slate-800 transition-colors'
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

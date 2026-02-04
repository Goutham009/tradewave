'use client';

import React, { useState } from 'react';
import { Menu, LogOut, Settings, Bell, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './MobileSidebar';
import { useSidebarPreference } from './hooks/useSidebarPreference';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  mobileSidebar?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'buyer' | 'seller' | 'admin';
}

export function SidebarLayout({
  sidebar,
  mobileSidebar,
  children,
  variant = 'buyer'
}: SidebarLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isCollapsed, toggleCollapsed, isLoaded } = useSidebarPreference();
  const { data: session } = useSession();
  const user = session?.user;

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  // Clone sidebar with collapse state
  const sidebarWithState = React.isValidElement(sidebar)
    ? React.cloneElement(sidebar as React.ReactElement<any>, {
        isCollapsed,
        onToggleCollapse: toggleCollapsed,
        onCloseMobile: closeMobile
      })
    : sidebar;

  const mobileSidebarContent = mobileSidebar || sidebarWithState;
  const mobileSidebarWithClose = React.isValidElement(mobileSidebarContent)
    ? React.cloneElement(mobileSidebarContent as React.ReactElement<any>, {
        isCollapsed: false,
        onCloseMobile: closeMobile
      })
    : mobileSidebarContent;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-shrink-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {isLoaded && sidebarWithState}
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} onClose={closeMobile}>
        {mobileSidebarWithClose}
      </MobileSidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={cn(
          'flex items-center h-16 px-4 border-b',
          variant === 'admin' 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
        )}>
          {/* Mobile menu button */}
          <button
            onClick={openMobile}
            className={cn(
              'p-2 rounded-lg transition-colors lg:hidden',
              variant === 'admin'
                ? 'hover:bg-slate-800 text-slate-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
            )}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Mobile Logo */}
          <div className="ml-2 flex items-center gap-2 lg:hidden">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              variant === 'admin'
                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            )}>
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className={cn(
              'font-bold',
              variant === 'admin' ? 'text-white' : 'text-gray-900 dark:text-white'
            )}>
              {variant === 'admin' ? 'Admin' : 'Tradewave'}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                  'flex items-center gap-2',
                  variant === 'admin' ? 'text-white hover:bg-slate-800' : ''
                )}>
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white',
                    variant === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                  )}>
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden text-left md:block">
                    <div className={cn(
                      'text-sm font-medium',
                      variant === 'admin' ? 'text-white' : 'text-gray-900 dark:text-white'
                    )}>
                      {user.name}
                    </div>
                    <div className={cn(
                      'text-xs',
                      variant === 'admin' ? 'text-slate-400' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {user.email}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn(
                'w-56',
                variant === 'admin' ? 'bg-slate-800 border-slate-700' : ''
              )}>
                <DropdownMenuLabel className={variant === 'admin' ? 'text-slate-300' : ''}>
                  <div className="flex flex-col space-y-1">
                    <p className={cn('text-sm font-medium', variant === 'admin' ? 'text-white' : '')}>
                      {user.name}
                    </p>
                    <p className={cn('text-xs', variant === 'admin' ? 'text-slate-400' : 'text-muted-foreground')}>
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={variant === 'admin' ? 'bg-slate-700' : ''} />
                <DropdownMenuItem asChild className={variant === 'admin' ? 'text-slate-300 hover:bg-slate-700' : ''}>
                  <Link href={variant === 'admin' ? '/admin/settings' : '/settings'} className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={variant === 'admin' ? 'bg-slate-700' : ''} />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={cn(
                    'cursor-pointer',
                    variant === 'admin' ? 'text-red-400 hover:text-red-300 hover:bg-slate-700' : 'text-red-600'
                  )}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        {/* Page Content */}
        <main className={cn(
          'flex-1 overflow-y-auto',
          variant === 'admin' ? 'bg-slate-950' : 'bg-gray-50 dark:bg-slate-950'
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

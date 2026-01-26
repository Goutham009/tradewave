'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'critical' | 'warning' | 'success';
  isCollapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({
  icon: Icon,
  label,
  href,
  badge,
  badgeVariant = 'default',
  isCollapsed = false,
  onClick
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  const badgeClasses = cn(
    'ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold min-w-[20px]',
    {
      'bg-blue-500 text-white': badgeVariant === 'default',
      'bg-red-500 text-white animate-pulse': badgeVariant === 'critical',
      'bg-yellow-500 text-white': badgeVariant === 'warning',
      'bg-green-500 text-white': badgeVariant === 'success'
    }
  );

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-slate-800',
        isActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-3 border-blue-500',
        !isActive && 'text-gray-600 dark:text-gray-400',
        isCollapsed && 'justify-center px-2'
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-500')} />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge !== null && (
            <span className={badgeClasses}>{badge}</span>
          )}
        </>
      )}
      
      {isCollapsed && badge !== undefined && badge !== null && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </Link>
  );
}

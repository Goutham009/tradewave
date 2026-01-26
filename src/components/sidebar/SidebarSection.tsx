'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarSectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  isCollapsed?: boolean;
  onToggle?: (id: string, expanded: boolean) => void;
}

export function SidebarSection({
  id,
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
  isCollapsed = false,
  onToggle
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(id, newExpanded);
  };

  if (isCollapsed) {
    return (
      <div className="py-2">
        <div className="flex justify-center py-2">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-1">
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider',
          'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          'transition-colors duration-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50'
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-300 ease-in-out',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out'
        )}
        style={{
          maxHeight: isExpanded ? contentHeight : 0,
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div ref={contentRef} className="pl-2 py-1 space-y-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

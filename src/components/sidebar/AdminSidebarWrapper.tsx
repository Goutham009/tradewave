'use client';

import React from 'react';
import { SidebarLayout } from './SidebarLayout';
import { AdminSidebar } from './AdminSidebar';

interface AdminSidebarWrapperProps {
  children: React.ReactNode;
}

export function AdminSidebarWrapper({ children }: AdminSidebarWrapperProps) {
  return (
    <SidebarLayout sidebar={<AdminSidebar />} variant="admin">
      {children}
    </SidebarLayout>
  );
}

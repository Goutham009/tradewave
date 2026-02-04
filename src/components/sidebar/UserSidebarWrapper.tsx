'use client';

import React from 'react';
import { SidebarLayout } from './SidebarLayout';
import { UserSidebar } from './UserSidebar';

interface UserSidebarWrapperProps {
  children: React.ReactNode;
}

export function UserSidebarWrapper({ children }: UserSidebarWrapperProps) {
  return (
    <SidebarLayout sidebar={<UserSidebar />} variant="buyer">
      {children}
    </SidebarLayout>
  );
}

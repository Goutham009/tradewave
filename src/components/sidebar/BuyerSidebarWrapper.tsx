'use client';

import React from 'react';
import { SidebarLayout } from './SidebarLayout';
import { BuyerSidebar } from './BuyerSidebar';

interface BuyerSidebarWrapperProps {
  children: React.ReactNode;
}

export function BuyerSidebarWrapper({ children }: BuyerSidebarWrapperProps) {
  return (
    <SidebarLayout sidebar={<BuyerSidebar />} variant="buyer">
      {children}
    </SidebarLayout>
  );
}

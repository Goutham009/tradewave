import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { BuyerSidebarWrapper } from '@/components/sidebar/BuyerSidebarWrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <BuyerSidebarWrapper>
      <div className="p-6">
        {children}
      </div>
    </BuyerSidebarWrapper>
  );
}

import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { UserSidebarWrapper } from '@/components/sidebar/UserSidebarWrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Unified dashboard for all users (buyers and sellers)
  return (
    <UserSidebarWrapper>
      {children}
    </UserSidebarWrapper>
  );
}

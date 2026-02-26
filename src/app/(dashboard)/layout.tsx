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

  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  if (['ACCOUNT_MANAGER', 'PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM'].includes(session.user.role || '')) {
    redirect('/internal');
  }

  // Unified dashboard for all users (buyers and sellers)
  return (
    <UserSidebarWrapper>
      {children}
    </UserSidebarWrapper>
  );
}

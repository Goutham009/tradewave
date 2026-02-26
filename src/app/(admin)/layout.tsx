import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { AdminSidebarWrapper } from '@/components/sidebar/AdminSidebarWrapper';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session) {
    redirect('/admin/login');
  }

  // Only allow ADMIN role
  if (session.user.role !== 'ADMIN') {
    if (['ACCOUNT_MANAGER', 'PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM'].includes(session.user.role || '')) {
      redirect('/internal');
    }

    redirect('/dashboard');
  }

  return (
    <div className="dark">
      <AdminSidebarWrapper>
        <div className="p-6">
          {children}
        </div>
      </AdminSidebarWrapper>
    </div>
  );
}

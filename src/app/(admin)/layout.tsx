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

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <AdminSidebarWrapper>
      <div className="p-6">
        {children}
      </div>
    </AdminSidebarWrapper>
  );
}

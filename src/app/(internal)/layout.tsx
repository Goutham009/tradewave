import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { InternalSidebar } from '@/components/internal/InternalSidebar';

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Only allow ACCOUNT_MANAGER and procurement roles
  const allowedRoles = ['ACCOUNT_MANAGER', 'PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM'];
  if (!allowedRoles.includes(session.user.role)) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    }

    redirect('/dashboard');
  }

  return (
    <div className="dark">
      <div className="flex h-screen bg-slate-950">
        <InternalSidebar userRole={session.user.role} userName={session.user.name || 'User'} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

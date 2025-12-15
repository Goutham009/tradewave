import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { UserRole } from '@/types';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    throw new Error('Forbidden');
  }
  return user;
}

export function isAdmin(role: string): boolean {
  return role === 'ADMIN';
}

export function isBuyer(role: string): boolean {
  return role === 'BUYER';
}

export function isSupplier(role: string): boolean {
  return role === 'SUPPLIER';
}

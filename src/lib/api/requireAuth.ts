import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName?: string;
}

export class AuthError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new AuthError('Not authenticated', 401);
  }
  
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    role: session.user.role || 'BUYER',
    companyName: session.user.companyName,
  };
}

import { requireAuth, AuthUser, AuthError } from './requireAuth';

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN') {
    throw new AuthError('Admin access required', 403);
  }
  
  return user;
}

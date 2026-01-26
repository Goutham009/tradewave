import { createHash } from 'crypto';

// Generate unsubscribe token for a user
export function generateUnsubscribeToken(userId: string, email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'unsubscribe-secret-key';
  return createHash('sha256')
    .update(`${userId}:${email}:${secret}`)
    .digest('hex')
    .slice(0, 32);
}

// Verify unsubscribe token
export function verifyUnsubscribeToken(userId: string, email: string, token: string): boolean {
  const expectedToken = generateUnsubscribeToken(userId, email);
  return token === expectedToken;
}

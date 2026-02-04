import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'tradewave-csrf-secret-change-in-production';

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create CSRF token with signature
 */
export function createSignedCsrfToken(): { token: string; signature: string } {
  const token = generateCsrfToken();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
  
  return { token, signature };
}

/**
 * Verify signed CSRF token
 */
export function verifyCsrfToken(token: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const signature = req.cookies['csrf-signature'];

  if (!token || !signature) {
    return res.status(403).json({
      success: false,
      error: 'Missing CSRF token',
    });
  }

  if (!verifyCsrfToken(token, signature)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token',
    });
  }

  return next();
}

/**
 * Set CSRF cookie and return token for client
 */
export function setCsrfCookie(res: NextApiResponse): string {
  const { token, signature } = createSignedCsrfToken();
  
  res.setHeader(
    'Set-Cookie',
    `csrf-signature=${signature}; Path=/; HttpOnly; SameSite=Strict; ${
      process.env.NODE_ENV === 'production' ? 'Secure;' : ''
    } Max-Age=3600`
  );
  
  return token;
}

import { NextApiRequest, NextApiResponse } from 'next';
import { checkRateLimit } from '@/lib/redis';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: NextApiRequest) => string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
};

/**
 * Get client IP from request
 */
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Rate limiter middleware for API routes
 */
export function rateLimiter(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, max, message, keyGenerator } = { ...defaultConfig, ...config };
  const windowSeconds = Math.floor(windowMs / 1000);

  return async function rateLimit(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    const key = keyGenerator
      ? keyGenerator(req)
      : `ratelimit:${getClientIp(req)}:${req.url}`;

    const result = await checkRateLimit(key, max, windowSeconds);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Date.now() + result.resetIn * 1000);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.resetIn);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: result.resetIn,
      });
    }

    return next();
  };
}

/**
 * Stricter rate limit for authentication endpoints
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

/**
 * Standard API rate limiter
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/**
 * Lenient rate limiter for read operations
 */
export const readRateLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
});

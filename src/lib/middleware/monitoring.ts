import { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/lib/logger';

/**
 * API monitoring middleware
 * Logs request/response metrics and timing
 */
export function apiMonitoring(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  const start = Date.now();
  const requestId = generateRequestId();

  // Add request ID header
  res.setHeader('X-Request-ID', requestId);

  // Log request
  logger.info('API Request', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: getClientIp(req),
  });

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const duration = Date.now() - start;

    logger.info('API Response', {
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });

    // Track slow requests
    if (duration > 1000) {
      logger.warn('Slow API Request', {
        requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }

    return originalJson(body);
  };

  return next();
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
 * Error tracking wrapper
 */
export function withErrorTracking<T>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      logger.error('Unhandled API Error', {
        method: req.method,
        url: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Don't expose internal errors
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  };
}

/**
 * Performance metrics collector
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  record(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }

  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  getAllStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    this.metrics.forEach((_, name) => {
      const stats = this.getStats(name);
      if (stats) {
        result[name] = stats;
      }
    });
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const metricsCollector = MetricsCollector.getInstance();

import { NextApiRequest, NextApiResponse } from 'next';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * Validate request body against Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      (req as any).validatedQuery = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

// Common validation schemas
export const createRequirementSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  targetPrice: z.number().positive().optional(),
  deliveryDate: z.string().datetime().optional(),
});

export const createQuotationSchema = z.object({
  requirementId: z.string().min(1, 'Requirement ID is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  totalPrice: z.number().positive('Total price must be positive'),
  deliveryDays: z.number().positive('Delivery days must be positive'),
  notes: z.string().max(1000).optional(),
  validUntil: z.string().datetime().optional(),
});

export const updateTransactionSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'PAYMENT_RECEIVED',
    'IN_PRODUCTION',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED',
  ]),
  notes: z.string().max(500).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['relevance', 'date', 'price']).optional(),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

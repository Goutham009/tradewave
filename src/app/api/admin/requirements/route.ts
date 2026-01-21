import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse, getPagination, validateFilters } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const filters = validateFilters(searchParams, ['status', 'category', 'dateFrom', 'dateTo', 'search']);
    
    // Build where clause
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }
    
    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          buyer: {
            select: { id: true, name: true, email: true, companyName: true },
          },
          _count: {
            select: { quotations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.requirement.count({ where }),
    ]);
    
    const formattedRequirements = requirements.map((req: any) => ({
      id: req.id,
      title: req.title,
      description: req.description,
      category: req.category,
      status: req.status,
      quantity: req.quantity,
      unit: req.unit,
      targetPrice: req.targetPrice ? Number(req.targetPrice) : null,
      currency: req.currency,
      deliveryLocation: req.deliveryLocation,
      deliveryDeadline: req.deliveryDeadline?.toISOString() || null,
      priority: req.priority,
      quotationCount: req._count?.quotations || 0,
      buyer: req.buyer,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
    }));
    
    return successResponse(formattedRequirements, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

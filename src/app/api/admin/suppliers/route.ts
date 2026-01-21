import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse, getPagination, validateFilters } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const filters = validateFilters(searchParams, ['verified', 'country', 'search']);
    
    // Build where clause
    const where: any = {};
    
    if (filters.verified !== undefined) {
      where.verified = filters.verified === 'true';
    }
    
    if (filters.country) {
      where.country = filters.country;
    }
    
    if (filters.search) {
      where.OR = [
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.supplier.count({ where }),
    ]);
    
    // Get stats
    const [verifiedCount, totalRevenue] = await Promise.all([
      prisma.supplier.count({ where: { verified: true } }),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    
    const formattedSuppliers = suppliers.map((supplier: any) => ({
      id: supplier.id,
      companyName: supplier.companyName,
      email: supplier.email,
      phone: supplier.phone || '',
      country: supplier.country || 'Unknown',
      city: supplier.city || '',
      verified: supplier.verified,
      rating: supplier.rating ? Number(supplier.rating) : 4.0,
      totalTransactions: supplier._count?.transactions || 0,
      totalRevenue: 0, // Would need to aggregate from transactions
      productCategories: supplier.categories || [],
      createdAt: supplier.createdAt.toISOString(),
      lastActive: supplier.updatedAt.toISOString(),
    }));
    
    return successResponse(formattedSuppliers, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

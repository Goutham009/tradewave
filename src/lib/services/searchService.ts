import prisma from '@/lib/db';

export interface SearchParams {
  query?: string;
  category?: string;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  status?: string;
  tier?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'price';
}

export interface SearchResult<T> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Search requirements with full-text search and filters
 */
export async function searchRequirements(
  params: SearchParams
): Promise<SearchResult<any>> {
  const {
    query,
    category,
    minQuantity,
    maxQuantity,
    status = 'OPEN',
    page = 1,
    limit = 20,
    sortBy = 'relevance',
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status,
  };

  // Text search (using contains for compatibility)
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Filters
  if (category) {
    where.category = category;
  }

  if (minQuantity || maxQuantity) {
    where.quantity = {};
    if (minQuantity) where.quantity.gte = minQuantity;
    if (maxQuantity) where.quantity.lte = maxQuantity;
  }

  // Sorting
  let orderBy: any = {};
  switch (sortBy) {
    case 'date':
      orderBy = { createdAt: 'desc' };
      break;
    case 'price':
      orderBy = { estimatedBudget: 'asc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  // Execute query
  const [results, total] = await Promise.all([
    prisma.requirement.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            status: true,
          },
        },
        _count: {
          select: {
            quotations: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.requirement.count({ where }),
  ]);

  return {
    results,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Search suppliers with tier filtering
 */
export async function searchSuppliers(
  params: SearchParams
): Promise<SearchResult<any>> {
  const {
    query,
    tier,
    page = 1,
    limit = 20,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {
    role: 'SUPPLIER',
    status: 'ACTIVE',
  };

  // Text search
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { companyName: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Tier filter (if compliance tier relation exists)
  if (tier && tier.length > 0) {
    where.kybProfile = {
      verificationStatus: 'APPROVED',
    };
  }

  const [results, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        kybProfile: {
          select: {
            status: true,
            riskScore: true,
          },
        },
        ratingStats: {
          select: {
            averageRating: true,
            totalReviews: true,
          },
        },
        _count: {
          select: {
            quotations: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    results,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(
  query: string,
  type: 'requirements' | 'suppliers'
): Promise<string[]> {
  if (!query || query.length < 2) return [];

  if (type === 'requirements') {
    const results = await prisma.requirement.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { title: true },
      take: 5,
    });
    return results.map((r) => r.title);
  } else {
    const results = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { companyName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { companyName: true },
      take: 5,
    });
    return results.map((r) => r.companyName).filter(Boolean) as string[];
  }
}

/**
 * Get available filter options
 */
export async function getFilterOptions() {
  const categories = await prisma.requirement.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
    take: 20,
  });

  const industries = await prisma.user.groupBy({
    by: ['industry'],
    where: { industry: { not: null } },
    _count: true,
    orderBy: { _count: { industry: 'desc' } },
    take: 20,
  });

  return {
    categories: categories.map((c) => c.category),
    industries: industries.map((i) => i.industry).filter(Boolean) as string[],
    tiers: ['TRUSTED', 'STANDARD', 'REVIEW'],
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const { 
      query, 
      type = 'PRODUCT',
      filters = {},
      page = 1,
      limit = 20 
    } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    let results: any[] = [];
    let total = 0;

    // Search based on type
    if (type === 'PRODUCT' || type === 'ALL') {
      const products = await prisma.requirement.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ],
          ...(filters.category && { category: filters.category }),
          ...(filters.minPrice && { budgetMin: { gte: filters.minPrice } }),
          ...(filters.maxPrice && { budgetMax: { lte: filters.maxPrice } })
        },
        include: {
          buyer: { select: { id: true, name: true, companyName: true } }
        },
        skip,
        take: limit
      });
      
      const productCount = await prisma.requirement.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        }
      });

      results = [...results, ...products.map(p => ({ ...p, resultType: 'PRODUCT' }))];
      total += productCount;
    }

    if (type === 'SELLER' || type === 'ALL') {
      const sellers = await prisma.supplier.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          isVerified: true
        },
        include: {
          user: { select: { id: true, name: true, email: true } }
        },
        skip: type === 'ALL' ? 0 : skip,
        take: type === 'ALL' ? 5 : limit
      });

      const sellerCount = await prisma.supplier.count({
        where: {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } }
          ]
        }
      });

      results = [...results, ...sellers.map(s => ({ ...s, resultType: 'SELLER' }))];
      if (type === 'SELLER') total = sellerCount;
    }

    if (type === 'BUYER' || type === 'ALL') {
      const buyers = await prisma.user.findMany({
        where: {
          role: 'BUYER',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          companyName: true,
          createdAt: true
        },
        skip: type === 'ALL' ? 0 : skip,
        take: type === 'ALL' ? 5 : limit
      });

      const buyerCount = await prisma.user.count({
        where: {
          role: 'BUYER',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { companyName: { contains: query, mode: 'insensitive' } }
          ]
        }
      });

      results = [...results, ...buyers.map(b => ({ ...b, resultType: 'BUYER' }))];
      if (type === 'BUYER') total = buyerCount;
    }

    // Log search
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prisma.searchLog.create({
      data: {
        userId: session?.user?.id || null,
        searchQuery: query,
        searchType: type,
        resultCount: results.length,
        ipAddress,
        userAgent
      }
    });

    return NextResponse.json({
      results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query,
      type
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

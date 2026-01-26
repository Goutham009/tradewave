import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const minQuantity = searchParams.get('minQuantity');
    const maxQuantity = searchParams.get('maxQuantity');

    const whereClause: any = {
      status: 'PUBLISHED',
      expiresAt: { gt: new Date() },
      OR: [
        { visibility: 'PUBLIC' },
        { visibility: 'OPEN' },
        { selectedSuppliers: { has: session.user.id } }
      ]
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { productCategory: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (category) {
      whereClause.industryCategory = category;
    }

    if (country) {
      whereClause.deliveryCountry = country.toUpperCase();
    }

    if (minQuantity) {
      whereClause.requestedQuantity = { gte: parseInt(minQuantity) };
    }

    if (maxQuantity) {
      whereClause.requestedQuantity = { 
        ...whereClause.requestedQuantity,
        lte: parseInt(maxQuantity) 
      };
    }

    const [rfqs, total] = await Promise.all([
      prisma.requestForQuote.findMany({
        where: whereClause,
        select: {
          id: true,
          rfqNumber: true,
          title: true,
          description: true,
          requestedQuantity: true,
          quantityUnit: true,
          deliveryCity: true,
          deliveryCountry: true,
          deliveryDate: true,
          industryCategory: true,
          productCategory: true,
          incoterms: true,
          qualityStandards: true,
          expiresAt: true,
          createdAt: true,
          viewCount: true,
          quotesReceived: true,
          buyer: { select: { companyName: true } },
          _count: { select: { quotes: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.requestForQuote.count({ where: whereClause })
    ]);

    // Get categories for filter
    const categories = await prisma.requestForQuote.groupBy({
      by: ['industryCategory'],
      where: { status: 'PUBLISHED' },
      _count: true
    });

    return NextResponse.json({
      rfqs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      filters: {
        categories: categories.map((c: any) => ({ 
          name: c.industryCategory, 
          count: c._count 
        }))
      }
    });
  } catch (error) {
    console.error('Error discovering RFQs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/purchase-history - Get purchase history with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const supplierId = searchParams.get('supplierId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'orderedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      buyerId: session.user.id
    };

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (category) {
      where.productCategory = category;
    }

    if (startDate || endDate) {
      where.orderedAt = {};
      if (startDate) {
        (where.orderedAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.orderedAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Fetch purchase history
    const [purchases, total] = await Promise.all([
      prisma.purchaseHistory.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              avatar: true
            }
          },
          transaction: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.purchaseHistory.count({ where })
    ]);

    // Get unique categories for filters
    const categories = await prisma.purchaseHistory.groupBy({
      by: ['productCategory'],
      where: { buyerId: session.user.id }
    });

    // Get unique suppliers for filters
    const suppliers = await prisma.purchaseHistory.findMany({
      where: { buyerId: session.user.id },
      select: {
        supplierId: true,
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      },
      distinct: ['supplierId']
    });

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        categories: categories.map(c => c.productCategory),
        suppliers: suppliers.map(s => s.supplier)
      }
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase history' },
      { status: 500 }
    );
  }
}

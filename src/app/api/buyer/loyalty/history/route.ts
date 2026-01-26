import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/loyalty/history - Get loyalty history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const eventType = searchParams.get('eventType');

    const skip = (page - 1) * limit;

    // Get buyer's loyalty status ID
    const loyaltyStatus = await prisma.buyerLoyaltyStatus.findUnique({
      where: { buyerId: session.user.id },
      select: { id: true }
    });

    if (!loyaltyStatus) {
      return NextResponse.json({
        history: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    const where: Record<string, unknown> = {
      buyerLoyaltyId: loyaltyStatus.id
    };

    if (eventType) {
      where.eventType = eventType;
    }

    const [history, total] = await Promise.all([
      prisma.loyaltyHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.loyaltyHistory.count({ where })
    ]);

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching loyalty history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty history' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/[id]/history - Trust score history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: buyerId } = await params;
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get trust score ID
    const trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId },
      select: { id: true }
    });

    if (!trustScore) {
      return NextResponse.json({ history: [], pagination: { total: 0, page, pages: 0 } });
    }

    const whereClause: any = { trustScoreId: trustScore.id };
    
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) whereClause.createdAt.lte = new Date(to);
    }

    const [history, total] = await Promise.all([
      prisma.buyerScoreHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.buyerScoreHistory.count({ where: whereClause })
    ]);

    return NextResponse.json({
      history,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching score history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

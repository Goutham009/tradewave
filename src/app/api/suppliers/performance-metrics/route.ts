import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // In production, fetch actual metrics from database
    // const supplier = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   include: { complianceTier: true, complianceScore: true },
    // });

    // Mock metrics for demo
    const metrics = {
      tier: 'VERIFIED',
      responseRate: 92,
      winRate: 34,
      averageRating: 4.6,
      activeInvitations: 5,
      completedOrders: 78,
      nextTier: 'TRUSTED',
      progressToNextTier: 72,
      ordersNeeded: 22,
      ratingNeeded: 4.8,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Performance metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

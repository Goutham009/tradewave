import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'PROCUREMENT_TEAM', 'ACCOUNT_MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supplierId = params.id;

    // In production, this would fetch real data from the database
    // Mock response for demo
    const performanceData = {
      supplierId,
      totalTransactions: 156,
      completedTransactions: 148,
      successRate: 94.9,
      onTimeDeliveries: 140,
      onTimeDeliveryRate: 94.6,
      averageRating: 4.8,
      totalReviews: 132,
      recentTransactions: [
        {
          id: 'txn-001',
          productType: 'Industrial Sensors',
          amount: 45000,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredOnTime: true,
          rating: 5.0,
        },
        {
          id: 'txn-002',
          productType: 'Automation Equipment',
          amount: 78000,
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredOnTime: true,
          rating: 4.8,
        },
        {
          id: 'txn-003',
          productType: 'Electronic Components',
          amount: 23000,
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          deliveredOnTime: false,
          rating: 4.2,
        },
      ],
      disputes: [
        {
          id: 'disp-001',
          title: 'Quality issue with batch #4521',
          description: 'Some units in the batch did not meet the specified tolerance levels.',
          resolved: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      qualityScore: 92,
      communicationScore: 95,
      reliabilityScore: 88,
    };

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Performance data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

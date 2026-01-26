import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get all disputes
    const disputes = await prisma.dispute.findMany({
      where: { createdAt: dateFilter.gte ? dateFilter : undefined },
      include: {
        transaction: {
          select: { amount: true }
        }
      }
    });

    // Status breakdown
    const statusBreakdown = disputes.reduce((acc: any, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});

    // Reason breakdown
    const reasonBreakdown = disputes.reduce((acc: any, d) => {
      acc[d.reason] = (acc[d.reason] || 0) + 1;
      return acc;
    }, {});

    // Resolution breakdown
    const resolvedDisputes = disputes.filter(d => d.resolvedAt);
    const resolutionBreakdown = resolvedDisputes.reduce((acc: any, d) => {
      const resolution = d.resolution || 'Unknown';
      acc[resolution] = (acc[resolution] || 0) + 1;
      return acc;
    }, {});

    // Calculate average resolution time
    const resolutionTimes = resolvedDisputes.map(d => {
      const created = new Date(d.createdAt).getTime();
      const resolved = new Date(d.resolvedAt!).getTime();
      return (resolved - created) / (1000 * 60 * 60 * 24); // Days
    });
    const avgResolutionDays = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Total transactions for dispute rate
    const totalTransactions = await prisma.transaction.count({
      where: { createdAt: dateFilter.gte ? dateFilter : undefined }
    });
    const disputeRate = totalTransactions > 0
      ? (disputes.length / totalTransactions * 100)
      : 0;

    // Daily metrics
    const dailyMetrics = await prisma.dailyMetrics.findMany({
      where: { date: dateFilter.gte ? dateFilter : undefined },
      orderBy: { date: 'asc' }
    });

    // Calculate chargebacks (disputes resolved in buyer's favor)
    const chargebacks = resolvedDisputes.filter(
      d => d.resolution === 'BUYER_FAVOR' || d.resolution === 'REFUND_ISSUED'
    ).length;
    const chargebackRate = disputes.length > 0
      ? (chargebacks / disputes.length * 100)
      : 0;

    return NextResponse.json({
      summary: {
        totalDisputes: disputes.length,
        openDisputes: statusBreakdown['OPEN'] || 0,
        resolvedDisputes: resolvedDisputes.length,
        disputeRate: disputeRate.toFixed(2),
        avgResolutionDays: avgResolutionDays.toFixed(1),
        chargebacks,
        chargebackRate: chargebackRate.toFixed(2)
      },
      breakdown: {
        byStatus: statusBreakdown,
        byReason: reasonBreakdown,
        byResolution: resolutionBreakdown
      },
      trends: dailyMetrics.map(d => ({
        date: d.date,
        newDisputes: d.newDisputes,
        resolvedDisputes: d.resolvedDisputes,
        chargebacks: d.chargebacks
      })),
      topReasons: Object.entries(reasonBreakdown)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count }))
    });
  } catch (error) {
    console.error('Dispute analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute analytics' },
      { status: 500 }
    );
  }
}

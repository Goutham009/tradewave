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
    const groupBy = searchParams.get('groupBy') || 'day';

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Transaction volume and count
    const transactions = await prisma.transaction.findMany({
      where: { createdAt: dateFilter.gte ? dateFilter : undefined },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        currency: true,
        createdAt: true
      }
    });

    // Group by status
    const statusBreakdown = transactions.reduce((acc: any, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // Group by payment method
    const paymentMethodBreakdown = transactions.reduce((acc: any, t) => {
      const method = t.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Calculate totals
    const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgOrderValue = transactions.length > 0 ? totalVolume / transactions.length : 0;

    // Success/failure rates
    const completed = transactions.filter(t => t.status === 'COMPLETED').length;
    const failed = transactions.filter(t => ['CANCELLED', 'REFUNDED'].includes(t.status)).length;
    const successRate = transactions.length > 0 ? (completed / transactions.length * 100) : 0;
    const failureRate = transactions.length > 0 ? (failed / transactions.length * 100) : 0;

    // Daily breakdown
    const dailyData = await prisma.dailyMetrics.findMany({
      where: { date: dateFilter.gte ? dateFilter : undefined },
      orderBy: { date: 'asc' }
    });

    // Top performing days
    const topDays = [...dailyData]
      .sort((a, b) => Number(b.transactionVolume) - Number(a.transactionVolume))
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalTransactions: transactions.length,
        totalVolume,
        avgOrderValue,
        successRate: successRate.toFixed(2),
        failureRate: failureRate.toFixed(2),
        completedCount: completed,
        failedCount: failed
      },
      breakdown: {
        byStatus: statusBreakdown,
        byPaymentMethod: paymentMethodBreakdown
      },
      trends: dailyData.map(d => ({
        date: d.date,
        count: d.transactionCount,
        volume: d.transactionVolume,
        successCount: d.successCount,
        failureCount: d.failureCount
      })),
      topDays: topDays.map(d => ({
        date: d.date,
        volume: d.transactionVolume,
        count: d.transactionCount
      }))
    });
  } catch (error) {
    console.error('Transaction analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction analytics' },
      { status: 500 }
    );
  }
}

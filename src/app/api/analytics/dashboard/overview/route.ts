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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get latest analytics snapshot
    const latestSnapshot = await prisma.analyticsSnapshot.findFirst({
      orderBy: { snapshotDate: 'desc' }
    });

    // Get daily metrics for last 30 days
    const dailyMetrics = await prisma.dailyMetrics.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    });

    // Calculate summary metrics
    const totalTransactions = await prisma.transaction.count();
    const recentTransactions = await prisma.transaction.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    const totalRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    });

    const weeklyRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // User counts
    const totalUsers = await prisma.user.count();
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    const sellerCount = await prisma.user.count({
      where: { role: 'SELLER' }
    });

    const buyerCount = await prisma.user.count({
      where: { role: 'BUYER' }
    });

    // Dispute metrics
    const totalDisputes = await prisma.dispute.count();
    const openDisputes = await prisma.dispute.count({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'PENDING_EVIDENCE'] } }
    });

    // Calculate success rate
    const completedTransactions = await prisma.transaction.count({
      where: { status: 'COMPLETED' }
    });
    const failedTransactions = await prisma.transaction.count({
      where: { status: { in: ['CANCELLED', 'REFUNDED'] } }
    });
    
    const successRate = totalTransactions > 0 
      ? (completedTransactions / totalTransactions * 100).toFixed(2)
      : 0;

    // Weekly trend calculations
    const previousWeekStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekTransactions = await prisma.transaction.count({
      where: {
        createdAt: { gte: previousWeekStart, lt: sevenDaysAgo }
      }
    });

    const transactionGrowth = previousWeekTransactions > 0
      ? ((recentTransactions - previousWeekTransactions) / previousWeekTransactions * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      overview: {
        totalTransactions,
        recentTransactions,
        transactionGrowth: Number(transactionGrowth),
        totalRevenue: totalRevenue._sum.amount || 0,
        weeklyRevenue: weeklyRevenue._sum.amount || 0,
        totalUsers,
        newUsersThisWeek,
        sellerCount,
        buyerCount,
        totalDisputes,
        openDisputes,
        successRate: Number(successRate),
        completedTransactions,
        failedTransactions
      },
      snapshot: latestSnapshot,
      dailyMetrics,
      trends: {
        transactions: dailyMetrics.map(d => ({
          date: d.date,
          count: d.transactionCount,
          volume: d.transactionVolume
        })),
        revenue: dailyMetrics.map(d => ({
          date: d.date,
          amount: d.revenue
        })),
        users: dailyMetrics.map(d => ({
          date: d.date,
          new: d.newUsers,
          active: d.activeUsers
        }))
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

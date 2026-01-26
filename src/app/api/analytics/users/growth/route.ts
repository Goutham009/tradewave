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
    const period = searchParams.get('period') || '30'; // days

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Total users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    // New signups in period
    const newSignups = await prisma.user.count({
      where: { createdAt: { gte: startDate } }
    });

    // New signups by role
    const newSignupsByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true }
    });

    // Daily signups
    const dailyMetrics = await prisma.dailyMetrics.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });

    // Calculate growth rate
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysAgo);
    
    const previousPeriodSignups = await prisma.user.count({
      where: {
        createdAt: { gte: previousPeriodStart, lt: startDate }
      }
    });

    const growthRate = previousPeriodSignups > 0
      ? ((newSignups - previousPeriodSignups) / previousPeriodSignups * 100)
      : 0;

    // Active users (users with transactions in period)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { buyerTransactions: { some: { createdAt: { gte: startDate } } } }
        ]
      }
    });

    // Churn estimate (users inactive for 30+ days who were previously active)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previouslyActiveUsers = await prisma.user.count({
      where: {
        buyerTransactions: {
          some: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
        }
      }
    });

    const stillActiveUsers = await prisma.user.count({
      where: {
        AND: [
          { buyerTransactions: { some: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } } },
          { buyerTransactions: { some: { createdAt: { gte: thirtyDaysAgo } } } }
        ]
      }
    });

    const churnRate = previouslyActiveUsers > 0
      ? ((previouslyActiveUsers - stillActiveUsers) / previouslyActiveUsers * 100)
      : 0;

    // Retention rate
    const retentionRate = 100 - churnRate;

    return NextResponse.json({
      summary: {
        totalUsers: usersByRole.reduce((sum, r) => sum + r._count.id, 0),
        newSignups,
        growthRate: growthRate.toFixed(1),
        activeUsers,
        churnRate: churnRate.toFixed(1),
        retentionRate: retentionRate.toFixed(1)
      },
      byRole: {
        total: usersByRole.reduce((acc: any, r) => {
          acc[r.role] = r._count.id;
          return acc;
        }, {}),
        new: newSignupsByRole.reduce((acc: any, r) => {
          acc[r.role] = r._count.id;
          return acc;
        }, {})
      },
      trends: dailyMetrics.map(d => ({
        date: d.date,
        newUsers: d.newUsers,
        activeUsers: d.activeUsers,
        returningUsers: d.returningUsers
      })),
      period: {
        start: startDate,
        end: new Date(),
        days: daysAgo
      }
    });
  } catch (error) {
    console.error('User growth analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user growth analytics' },
      { status: 500 }
    );
  }
}

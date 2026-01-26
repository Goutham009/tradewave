import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get high-risk users
    const highRiskUsers = await prisma.fraudScore.findMany({
      where: {
        OR: [
          { riskLevel: 'HIGH' },
          { riskLevel: 'CRITICAL' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            createdAt: true
          }
        }
      },
      orderBy: { overallFraudScore: 'desc' },
      take: 20
    });

    // Get flagged users for review
    const flaggedForReview = await prisma.fraudScore.count({
      where: { isFlaggedForReview: true }
    });

    // Get high-risk transactions
    const highRiskTransactions = await prisma.transactionRiskAnalysis.findMany({
      where: {
        OR: [
          { riskLevel: 'HIGH' },
          { riskLevel: 'CRITICAL' }
        ]
      },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            buyer: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { riskScore: 'desc' },
      take: 20
    });

    // Get fraud score distribution
    const riskDistribution = await prisma.fraudScore.groupBy({
      by: ['riskLevel'],
      _count: { id: true }
    });

    // Recent fraud indicators
    const recentIndicators = await prisma.fraudScore.findMany({
      where: {
        fraudIndicators: { isEmpty: false }
      },
      select: {
        fraudIndicators: true,
        user: {
          select: { id: true, name: true }
        },
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    // Calculate summary stats
    const totalFraudScores = await prisma.fraudScore.count();
    const criticalCount = riskDistribution.find(r => r.riskLevel === 'CRITICAL')?._count.id || 0;
    const highCount = riskDistribution.find(r => r.riskLevel === 'HIGH')?._count.id || 0;

    return NextResponse.json({
      summary: {
        totalUsers: totalFraudScores,
        criticalRisk: criticalCount,
        highRisk: highCount,
        flaggedForReview
      },
      highRiskUsers,
      highRiskTransactions,
      riskDistribution: riskDistribution.reduce((acc: Record<string, number>, r) => {
        acc[r.riskLevel] = r._count.id;
        return acc;
      }, {}),
      recentIndicators
    });
  } catch (error) {
    console.error('Fraud dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fraud dashboard' },
      { status: 500 }
    );
  }
}

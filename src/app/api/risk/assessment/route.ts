import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/risk/assessment - Get full risk assessment
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get risk profile
    const riskProfile = await prisma.riskManagementProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        restrictions: { where: { isActive: true } },
        riskHistory: {
          take: 30,
          orderBy: { createdAt: 'desc' }
        },
        alerts: {
          where: { isActive: true }
        }
      }
    });

    // Get KYB data
    const kyb = await prisma.supplierKYB.findUnique({
      where: { userId: session.user.id },
      include: {
        riskAssessment: true,
        badge: true
      }
    });

    // Get buyer trust score if exists
    const trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId: session.user.id },
      include: {
        flags: { where: { status: 'ACTIVE' } }
      }
    });

    // Get recent transactions count
    const recentTransactions = await prisma.transaction.count({
      where: {
        buyerId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }
    });

    // Get dispute count
    const disputes = await prisma.dispute.count({
      where: {
        filedByUserId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      }
    });

    // Calculate component scores breakdown
    const assessment = {
      riskProfile,
      kyb: kyb ? {
        status: kyb.status,
        riskScore: kyb.riskScore,
        badge: kyb.badge,
        riskAssessment: kyb.riskAssessment
      } : null,
      trustScore: trustScore ? {
        overallScore: trustScore.overallScore,
        riskLevel: trustScore.riskLevel,
        activeFlags: trustScore.flags.length
      } : null,
      metrics: {
        recentTransactions,
        disputes,
        daysSinceLastTransaction: null // Would calculate from last transaction
      },
      recommendations: generateRecommendations(riskProfile, kyb, trustScore)
    };

    return NextResponse.json({ assessment });

  } catch (error) {
    console.error('Risk Assessment Error:', error);
    return NextResponse.json({ error: 'Failed to fetch risk assessment' }, { status: 500 });
  }
}

function generateRecommendations(riskProfile: any, kyb: any, trustScore: any): string[] {
  const recommendations: string[] = [];

  if (!kyb || kyb.status !== 'VERIFIED') {
    recommendations.push('Complete KYB verification to improve your risk score');
  }

  if (kyb?.expiresAt && new Date(kyb.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
    recommendations.push('Your KYB verification is expiring soon. Please renew it.');
  }

  if (riskProfile?.overallRiskLevel === 'HIGH' || riskProfile?.overallRiskLevel === 'CRITICAL') {
    recommendations.push('Your risk level is elevated. Maintain good transaction history to improve.');
  }

  if (trustScore?.activeFlags > 0) {
    recommendations.push('You have active risk flags. Review and address them to improve your score.');
  }

  if (riskProfile?.hasRestrictions) {
    recommendations.push('You have active restrictions. Contact support for assistance.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your risk profile is healthy. Keep up the good practices!');
  }

  return recommendations;
}

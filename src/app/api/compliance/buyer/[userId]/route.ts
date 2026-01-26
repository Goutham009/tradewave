// =============================================================================
// PHASE 9: BUYER COMPLIANCE API
// GET /api/compliance/buyer/[userId] - Get buyer compliance data
// POST /api/compliance/buyer/[userId] - Run compliance assessment
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import {
  runBuyerComplianceAssessment,
  getBuyerMetrics,
  calculateBuyerComplianceScore,
  BUYER_TIER_THRESHOLDS,
} from '@/lib/compliance';

interface RouteParams {
  params: { userId: string };
}

// GET - Retrieve buyer compliance data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get buyer compliance record
    const complianceRecord = await prisma.buyerComplianceRecord.findUnique({
      where: { buyerId: userId },
    });

    // Get buyer loyalty status
    const loyaltyStatus = await prisma.buyerLoyaltyStatus.findUnique({
      where: { buyerId: userId },
      include: {
        currentTier: true,
      },
    });

    // Get current metrics
    const metrics = await getBuyerMetrics(userId);
    const compliance = calculateBuyerComplianceScore(metrics);

    // Determine current tier
    let currentTier = 'BRONZE';
    if (loyaltyStatus?.currentTier) {
      const tierName = loyaltyStatus.currentTier.tierName.toUpperCase();
      if (['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].includes(tierName)) {
        currentTier = tierName;
      }
    }

    const tierInfo = BUYER_TIER_THRESHOLDS[currentTier as keyof typeof BUYER_TIER_THRESHOLDS];

    return NextResponse.json({
      user: {
        ...user,
        tierLabel: `(Buyer Tier) ${tierInfo.displayName}`,
      },
      compliance: {
        score: compliance.complianceScore,
        riskLevel: compliance.riskLevel,
        isComplianceRisk: compliance.isComplianceRisk,
        violations: compliance.violations,
        recommendations: compliance.recommendations,
        lastAssessment: complianceRecord?.lastScoreCalculation,
      },
      tier: {
        current: currentTier,
        displayName: tierInfo.displayName,
        badgeColor: tierInfo.badgeColor,
        discountPercentage: tierInfo.discountPercentage,
      },
      metrics: {
        totalOrderCount: metrics.totalOrderCount,
        totalAmountSpent: `$${metrics.totalAmountSpent.toLocaleString()}`,
        cancellationRate: (metrics.cancellationRate * 100).toFixed(1) + '%',
        disputesInitiated: metrics.disputesInitiated,
        disputesWon: metrics.disputesWon,
        disputesLost: metrics.disputesLost,
        onTimePaymentRate: (metrics.onTimePaymentRate * 100).toFixed(1) + '%',
      },
      loyalty: loyaltyStatus ? {
        totalPointsEarned: Number(loyaltyStatus.totalPointsEarned),
        availablePoints: Number(loyaltyStatus.availablePoints),
        joinedAt: loyaltyStatus.joinedAt,
        lastOrderAt: loyaltyStatus.lastOrderAt,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching buyer compliance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer compliance data' },
      { status: 500 }
    );
  }
}

// POST - Run compliance assessment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Run full compliance assessment
    const result = await runBuyerComplianceAssessment(userId);

    const tierInfo = BUYER_TIER_THRESHOLDS[result.assessment.currentTier];

    return NextResponse.json({
      success: true,
      message: 'Buyer compliance assessment complete',
      assessment: {
        currentTier: result.assessment.currentTier,
        currentTierLabel: `(Buyer Tier) ${tierInfo.displayName}`,
        proposedTier: result.assessment.proposedTier,
        shouldChangeTier: result.assessment.shouldChangeTier,
        changeReason: result.assessment.changeReason,
      },
      compliance: {
        score: result.compliance.complianceScore,
        riskLevel: result.compliance.riskLevel,
        isComplianceRisk: result.compliance.isComplianceRisk,
        violations: result.compliance.violations,
        recommendations: result.compliance.recommendations,
      },
    });
  } catch (error) {
    console.error('Error running buyer compliance assessment:', error);
    return NextResponse.json(
      { error: 'Failed to run compliance assessment' },
      { status: 500 }
    );
  }
}

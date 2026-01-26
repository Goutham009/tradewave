// =============================================================================
// PHASE 9: SUPPLIER COMPLIANCE API
// GET /api/compliance/supplier/[supplierId] - Get supplier compliance data
// POST /api/compliance/supplier/[supplierId] - Run compliance assessment
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import {
  runSupplierComplianceAssessment,
  getSupplierMetrics,
  calculateSupplierComplianceScore,
  SUPPLIER_TIER_THRESHOLDS,
} from '@/lib/compliance';

interface RouteParams {
  params: { supplierId: string };
}

// GET - Retrieve supplier compliance data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supplierId } = params;

    // Get supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        verified: true,
        overallRating: true,
        totalReviews: true,
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Get compliance record
    const complianceRecord = await prisma.supplierComplianceRecord.findUnique({
      where: { supplierId },
    });

    // Get loyalty tier
    const loyaltyTier = await prisma.supplierLoyaltyTier.findUnique({
      where: { supplierId },
    });

    // Get pending tier change requests
    const pendingTierChange = await prisma.supplierTierChangeRequest.findFirst({
      where: {
        supplierId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get active violations
    const activeViolations = await prisma.supplierComplianceViolation.findMany({
      where: {
        supplierId,
        status: { in: ['OPEN', 'ACKNOWLEDGED'] },
      },
      orderBy: { detectedAt: 'desc' },
      take: 10,
    });

    // Get current metrics
    const metrics = await getSupplierMetrics(supplierId);
    const compliance = calculateSupplierComplianceScore(metrics);

    const currentTier = loyaltyTier?.currentTier || 'STANDARD';
    const tierInfo = SUPPLIER_TIER_THRESHOLDS[currentTier as keyof typeof SUPPLIER_TIER_THRESHOLDS];

    return NextResponse.json({
      supplier: {
        ...supplier,
        tierLabel: `(Seller Tier) ${tierInfo.displayName}`,
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
        visibilityMultiplier: loyaltyTier?.visibilityMultiplier || tierInfo.visibilityMultiplier,
        appliedAt: loyaltyTier?.tierAppliedAt,
      },
      metrics: {
        transactionCount: metrics.transactionCount,
        completionRate: (metrics.completionRate * 100).toFixed(1) + '%',
        averageRating: metrics.averageRating.toFixed(1),
        disputeRate: (metrics.disputeRate * 100).toFixed(1) + '%',
        returnRate: (metrics.returnRate * 100).toFixed(1) + '%',
        kybStatus: metrics.kybStatus,
        kybVerified: metrics.kybVerified,
      },
      pendingTierChange: pendingTierChange ? {
        id: pendingTierChange.id,
        proposedTier: pendingTierChange.proposedTier,
        previousTier: pendingTierChange.previousTier,
        reason: pendingTierChange.changeReason,
        status: pendingTierChange.status,
        createdAt: pendingTierChange.createdAt,
      } : null,
      activeViolations: activeViolations.map(v => ({
        id: v.id,
        type: v.violationType,
        severity: v.severity,
        description: v.description,
        status: v.status,
        detectedAt: v.detectedAt,
        remediationDeadline: v.remediationDeadline,
      })),
    });
  } catch (error) {
    console.error('Error fetching supplier compliance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier compliance data' },
      { status: 500 }
    );
  }
}

// POST - Run compliance assessment (flag-only, no auto-tier change)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { supplierId } = params;

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Run full compliance assessment
    const result = await runSupplierComplianceAssessment(supplierId);

    const tierInfo = SUPPLIER_TIER_THRESHOLDS[result.assessment.currentTier];

    return NextResponse.json({
      success: true,
      message: result.tierChangeRequestId 
        ? 'Assessment complete. Tier change flagged for admin review.'
        : 'Assessment complete. No tier change needed.',
      assessment: {
        currentTier: result.assessment.currentTier,
        currentTierLabel: `(Seller Tier) ${tierInfo.displayName}`,
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
      tierChangeRequestId: result.tierChangeRequestId,
    });
  } catch (error) {
    console.error('Error running supplier compliance assessment:', error);
    return NextResponse.json(
      { error: 'Failed to run compliance assessment' },
      { status: 500 }
    );
  }
}

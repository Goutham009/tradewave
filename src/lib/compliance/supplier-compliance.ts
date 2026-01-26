// =============================================================================
// PHASE 9: SUPPLIER COMPLIANCE SCORING & TIER ASSESSMENT ENGINE
// =============================================================================

import prisma from '@/lib/db';
import {
  SupplierTierName,
  RiskLevel,
  SUPPLIER_TIER_THRESHOLDS,
  SupplierMetrics,
  ComplianceAssessmentResult,
  SupplierTierAssessmentResult,
} from './types';

/**
 * Fetch supplier metrics from database
 */
export async function getSupplierMetrics(supplierId: string): Promise<SupplierMetrics> {
  // Get supplier with transactions
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      transactions: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!supplier) {
    throw new Error(`Supplier not found: ${supplierId}`);
  }

  const transactions = supplier.transactions;
  const transactionCount = transactions.length;
  
  // Count completed transactions
  const completedStatuses = ['COMPLETED', 'ESCROW_RELEASED', 'FUNDS_RELEASED'];
  const completedTransactions = transactions.filter(t => 
    completedStatuses.includes(t.status)
  ).length;
  
  const completionRate = transactionCount > 0 
    ? completedTransactions / transactionCount 
    : 0;

  // Get dispute count for this supplier's transactions
  const disputeCount = await prisma.dispute.count({
    where: {
      transaction: {
        supplierId: supplierId,
      },
    },
  });

  const disputeRate = transactionCount > 0 
    ? disputeCount / transactionCount 
    : 0;

  // Get return count for this supplier's transactions
  const returnCount = await prisma.return.count({
    where: {
      transaction: {
        supplierId: supplierId,
      },
    },
  });

  const returnRate = transactionCount > 0 
    ? returnCount / transactionCount 
    : 0;

  // Get KYB status (check if supplier has a linked user with KYB)
  // For now, use the supplier's verified status and look for SupplierKYB
  const supplierKYB = await prisma.supplierKYB.findFirst({
    where: {
      user: {
        email: supplier.email,
      },
    },
    select: {
      status: true,
      expiresAt: true,
    },
  });

  const kybStatus = supplierKYB?.status || 'NOT_SUBMITTED';
  const kybVerified = kybStatus === 'VERIFIED';
  const kybExpired = supplierKYB?.expiresAt 
    ? new Date(supplierKYB.expiresAt) < new Date() 
    : false;

  return {
    transactionCount,
    completedTransactions,
    completionRate,
    averageRating: Number(supplier.overallRating) || 0,
    totalReviews: supplier.totalReviews,
    disputeCount,
    disputeRate,
    returnCount,
    returnRate,
    kybStatus,
    kybVerified,
    kybExpired,
  };
}

/**
 * Calculate supplier compliance score (0-100)
 */
export function calculateSupplierComplianceScore(metrics: SupplierMetrics): ComplianceAssessmentResult {
  let score = 50; // Base score
  const violations: string[] = [];
  const recommendations: string[] = [];

  // KYB verification bonus/penalty
  if (metrics.kybVerified && !metrics.kybExpired) {
    score += 20;
  } else if (metrics.kybExpired) {
    score -= 15;
    violations.push('KYB verification has expired');
    recommendations.push('Renew KYB verification to restore compliance score');
  } else if (metrics.kybStatus === 'NOT_SUBMITTED') {
    score -= 10;
    recommendations.push('Submit KYB verification to improve compliance score');
  } else if (metrics.kybStatus === 'REJECTED') {
    score -= 20;
    violations.push('KYB verification was rejected');
    recommendations.push('Address KYB rejection issues and resubmit');
  }

  // Completion rate impact
  if (metrics.completionRate >= 0.95) {
    score += 15;
  } else if (metrics.completionRate >= 0.85) {
    score += 5;
  } else if (metrics.completionRate < 0.70) {
    score -= 15;
    violations.push(`Low completion rate: ${(metrics.completionRate * 100).toFixed(1)}%`);
    recommendations.push('Improve order fulfillment to increase completion rate');
  }

  // Rating impact
  if (metrics.averageRating >= 4.5) {
    score += 10;
  } else if (metrics.averageRating >= 4.0) {
    score += 5;
  } else if (metrics.averageRating < 3.0 && metrics.totalReviews > 5) {
    score -= 10;
    violations.push(`Low average rating: ${metrics.averageRating.toFixed(1)}`);
    recommendations.push('Focus on customer satisfaction to improve ratings');
  }

  // Dispute rate impact
  if (metrics.disputeRate <= 0.02) {
    score += 10;
  } else if (metrics.disputeRate <= 0.05) {
    score += 5;
  } else if (metrics.disputeRate > 0.10) {
    score -= 20;
    violations.push(`High dispute rate: ${(metrics.disputeRate * 100).toFixed(1)}%`);
    recommendations.push('Address dispute causes to reduce dispute rate');
  } else if (metrics.disputeRate > 0.05) {
    score -= 10;
    violations.push(`Elevated dispute rate: ${(metrics.disputeRate * 100).toFixed(1)}%`);
  }

  // Return rate impact
  if (metrics.returnRate <= 0.05) {
    score += 5;
  } else if (metrics.returnRate > 0.15) {
    score -= 15;
    violations.push(`High return rate: ${(metrics.returnRate * 100).toFixed(1)}%`);
    recommendations.push('Improve product quality to reduce returns');
  } else if (metrics.returnRate > 0.10) {
    score -= 5;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let riskLevel: RiskLevel;
  if (score >= 70) {
    riskLevel = 'LOW';
  } else if (score >= 50) {
    riskLevel = 'MEDIUM';
  } else if (score >= 30) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'CRITICAL';
  }

  return {
    complianceScore: Math.round(score),
    riskLevel,
    isComplianceRisk: score < 50,
    violations,
    recommendations,
  };
}

/**
 * Determine supplier tier based on metrics
 */
export function determineSupplierTier(metrics: SupplierMetrics, complianceScore: number): SupplierTierName {
  const trusted = SUPPLIER_TIER_THRESHOLDS.TRUSTED;
  const standard = SUPPLIER_TIER_THRESHOLDS.STANDARD;

  // Check TRUSTED tier
  if (
    metrics.transactionCount >= trusted.minTransactionCount &&
    metrics.averageRating >= trusted.minAverageRating &&
    metrics.completionRate >= trusted.minCompletionRate &&
    complianceScore >= trusted.minComplianceScore &&
    metrics.disputeRate <= trusted.maxDisputeRate &&
    metrics.returnRate <= trusted.maxReturnRate &&
    metrics.kybVerified &&
    !metrics.kybExpired
  ) {
    return 'TRUSTED';
  }

  // Check STANDARD tier
  if (
    metrics.transactionCount >= standard.minTransactionCount &&
    metrics.averageRating >= standard.minAverageRating &&
    metrics.completionRate >= standard.minCompletionRate &&
    complianceScore >= standard.minComplianceScore &&
    metrics.disputeRate <= standard.maxDisputeRate &&
    metrics.returnRate <= standard.maxReturnRate
  ) {
    return 'STANDARD';
  }

  // Default to REVIEW
  return 'REVIEW';
}

/**
 * Full supplier tier assessment - determines if tier should change
 * NOTE: Does NOT execute tier change - only flags for admin review
 */
export async function assessSupplierTier(supplierId: string): Promise<SupplierTierAssessmentResult> {
  // Get current tier
  const currentTierRecord = await prisma.supplierLoyaltyTier.findUnique({
    where: { supplierId },
  });

  const currentTier = (currentTierRecord?.currentTier || 'STANDARD') as SupplierTierName;

  // Get metrics
  const metrics = await getSupplierMetrics(supplierId);
  
  // Calculate compliance score
  const { complianceScore } = calculateSupplierComplianceScore(metrics);
  
  // Determine proposed tier
  const proposedTier = determineSupplierTier(metrics, complianceScore);

  // Check if tier should change
  const shouldChangeTier = currentTier !== proposedTier;
  
  let changeReason = '';
  if (shouldChangeTier) {
    const tierOrder: SupplierTierName[] = ['REVIEW', 'STANDARD', 'TRUSTED'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const proposedIndex = tierOrder.indexOf(proposedTier);
    
    if (proposedIndex > currentIndex) {
      changeReason = `Metrics improved: eligible for upgrade from ${currentTier} to ${proposedTier}`;
    } else {
      changeReason = `Metrics declined: recommended downgrade from ${currentTier} to ${proposedTier}`;
    }
  }

  const visibilityMultiplier = SUPPLIER_TIER_THRESHOLDS[proposedTier].visibilityMultiplier;

  return {
    currentTier,
    proposedTier,
    shouldChangeTier,
    changeReason,
    metrics,
    complianceScore,
    visibilityMultiplier,
  };
}

/**
 * Update supplier compliance record in database
 */
export async function updateSupplierComplianceRecord(
  supplierId: string,
  assessment: ComplianceAssessmentResult
): Promise<void> {
  const now = new Date();
  
  await prisma.supplierComplianceRecord.upsert({
    where: { supplierId },
    create: {
      supplierId,
      complianceScore: assessment.complianceScore,
      riskLevel: assessment.riskLevel,
      isComplianceRisk: assessment.isComplianceRisk,
      lastScoreCalculation: now,
      scoreHistory: JSON.stringify([{
        score: assessment.complianceScore,
        date: now.toISOString(),
        violations: assessment.violations,
      }]),
    },
    update: {
      complianceScore: assessment.complianceScore,
      riskLevel: assessment.riskLevel,
      isComplianceRisk: assessment.isComplianceRisk,
      lastScoreCalculation: now,
      // Append to score history (keep last 30 entries)
      scoreHistory: {
        set: await (async () => {
          const existing = await prisma.supplierComplianceRecord.findUnique({
            where: { supplierId },
            select: { scoreHistory: true },
          });
          const history = existing?.scoreHistory ? JSON.parse(existing.scoreHistory) : [];
          history.push({
            score: assessment.complianceScore,
            date: now.toISOString(),
            violations: assessment.violations,
          });
          return JSON.stringify(history.slice(-30));
        })(),
      },
    },
  });
}

/**
 * Update supplier loyalty tier record in database
 */
export async function updateSupplierTierRecord(
  supplierId: string,
  metrics: SupplierMetrics,
  complianceScore: number,
  currentTier: SupplierTierName
): Promise<void> {
  const tierThresholds = SUPPLIER_TIER_THRESHOLDS[currentTier];
  
  await prisma.supplierLoyaltyTier.upsert({
    where: { supplierId },
    create: {
      supplierId,
      currentTier,
      transactionCount: metrics.transactionCount,
      averageRating: metrics.averageRating,
      completionRate: metrics.completionRate,
      complianceScore,
      disputeRate: metrics.disputeRate,
      returnRate: metrics.returnRate,
      visibilityMultiplier: tierThresholds.visibilityMultiplier,
      previousTiers: JSON.stringify([]),
    },
    update: {
      transactionCount: metrics.transactionCount,
      averageRating: metrics.averageRating,
      completionRate: metrics.completionRate,
      complianceScore,
      disputeRate: metrics.disputeRate,
      returnRate: metrics.returnRate,
      visibilityMultiplier: tierThresholds.visibilityMultiplier,
    },
  });
}

/**
 * Create a tier change request for admin review
 * NOTE: This DOES NOT change the tier - admin must approve
 */
export async function createSupplierTierChangeRequest(
  supplierId: string,
  assessment: SupplierTierAssessmentResult
): Promise<string> {
  const deadlineHours = assessment.proposedTier === 'REVIEW' ? 24 : 72;
  const approvalDeadline = new Date();
  approvalDeadline.setHours(approvalDeadline.getHours() + deadlineHours);

  const request = await prisma.supplierTierChangeRequest.create({
    data: {
      supplierId,
      proposedTier: assessment.proposedTier,
      previousTier: assessment.currentTier,
      changeReason: assessment.changeReason,
      metricsSnapshot: JSON.stringify(assessment.metrics),
      status: 'PENDING',
      approvalDeadline,
    },
  });

  // Create admin notification
  const severity = assessment.proposedTier === 'REVIEW' ? 'HIGH' : 'MEDIUM';
  const actionDeadline = new Date();
  actionDeadline.setHours(actionDeadline.getHours() + (severity === 'HIGH' ? 24 : 48));

  await prisma.adminSupplierTierNotification.create({
    data: {
      tierChangeRequestId: request.id,
      supplierId,
      notificationType: assessment.proposedTier === 'REVIEW' 
        ? 'TIER_DOWNGRADE_PENDING' 
        : 'TIER_UPGRADE_PENDING',
      severity,
      requiresAction: true,
      actionDeadline,
    },
  });

  return request.id;
}

/**
 * Full supplier compliance assessment workflow
 * 1. Calculate metrics
 * 2. Calculate compliance score
 * 3. Assess tier
 * 4. Update records
 * 5. Create tier change request if needed (for admin approval)
 */
export async function runSupplierComplianceAssessment(supplierId: string): Promise<{
  assessment: SupplierTierAssessmentResult;
  compliance: ComplianceAssessmentResult;
  tierChangeRequestId: string | null;
}> {
  // Get metrics
  const metrics = await getSupplierMetrics(supplierId);
  
  // Calculate compliance
  const compliance = calculateSupplierComplianceScore(metrics);
  
  // Assess tier
  const assessment = await assessSupplierTier(supplierId);
  
  // Update compliance record
  await updateSupplierComplianceRecord(supplierId, compliance);
  
  // Update tier record (with current metrics, but NOT changing tier)
  await updateSupplierTierRecord(
    supplierId,
    metrics,
    compliance.complianceScore,
    assessment.currentTier
  );
  
  // Create tier change request if tier should change
  let tierChangeRequestId: string | null = null;
  if (assessment.shouldChangeTier) {
    // Check if there's already a pending request
    const existingRequest = await prisma.supplierTierChangeRequest.findFirst({
      where: {
        supplierId,
        status: 'PENDING',
      },
    });
    
    if (!existingRequest) {
      tierChangeRequestId = await createSupplierTierChangeRequest(supplierId, assessment);
    }
  }
  
  return {
    assessment,
    compliance,
    tierChangeRequestId,
  };
}

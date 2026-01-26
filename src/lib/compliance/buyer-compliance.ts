// =============================================================================
// PHASE 9: BUYER COMPLIANCE SCORING & TIER ASSESSMENT ENGINE
// =============================================================================

import prisma from '@/lib/db';
import {
  BuyerTierName,
  RiskLevel,
  BUYER_TIER_THRESHOLDS,
  BuyerMetrics,
  ComplianceAssessmentResult,
  BuyerTierAssessmentResult,
} from './types';

/**
 * Fetch buyer metrics from database
 */
export async function getBuyerMetrics(userId: string): Promise<BuyerMetrics> {
  // Get user's transactions as buyer
  const transactions = await prisma.transaction.findMany({
    where: { buyerId: userId },
    select: {
      id: true,
      status: true,
      amount: true,
      createdAt: true,
    },
  });

  const totalOrderCount = transactions.length;
  
  // Calculate total amount spent (completed transactions)
  const completedStatuses = ['COMPLETED', 'ESCROW_RELEASED', 'FUNDS_RELEASED'];
  const completedTransactions = transactions.filter(t => 
    completedStatuses.includes(t.status)
  );
  const totalAmountSpent = completedTransactions.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  // Count cancelled orders
  const cancelledStatuses = ['CANCELLED', 'BUYER_CANCELLED'];
  const cancelledOrderCount = transactions.filter(t => 
    cancelledStatuses.includes(t.status)
  ).length;
  
  const cancellationRate = totalOrderCount > 0 
    ? cancelledOrderCount / totalOrderCount 
    : 0;

  // Get disputes initiated by this buyer
  const disputes = await prisma.dispute.findMany({
    where: {
      filedByUserId: userId,
    },
    select: {
      id: true,
      status: true,
      adminDecision: true,
    },
  });

  const disputesInitiated = disputes.length;
  const disputesWon = disputes.filter(d => 
    d.adminDecision === 'FULL_REFUND' || d.adminDecision === 'PARTIAL_REFUND'
  ).length;
  const disputesLost = disputes.filter(d => 
    d.adminDecision === 'FULL_PAYMENT' || d.adminDecision === 'SPLIT_50_50'
  ).length;

  // Get payment metrics from BuyerLoyaltyStatus if exists
  const loyaltyStatus = await prisma.buyerLoyaltyStatus.findUnique({
    where: { buyerId: userId },
    select: {
      totalOrderCount: true,
      totalAmountSpent: true,
    },
  });

  // Calculate payment timing (simplified - would need payment records for accurate data)
  // For now, use defaults
  const averagePaymentDays = 0;
  const latePaymentCount = 0;
  const onTimePaymentRate = 1.0;

  return {
    totalOrderCount: loyaltyStatus?.totalOrderCount || totalOrderCount,
    totalAmountSpent: Number(loyaltyStatus?.totalAmountSpent) || totalAmountSpent,
    cancelledOrderCount,
    cancellationRate,
    disputesInitiated,
    disputesWon,
    disputesLost,
    averagePaymentDays,
    latePaymentCount,
    onTimePaymentRate,
  };
}

/**
 * Calculate buyer compliance score (0-100)
 */
export function calculateBuyerComplianceScore(metrics: BuyerMetrics): ComplianceAssessmentResult {
  let score = 50; // Base score
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Order history bonus
  if (metrics.totalOrderCount >= 50) {
    score += 15;
  } else if (metrics.totalOrderCount >= 20) {
    score += 10;
  } else if (metrics.totalOrderCount >= 5) {
    score += 5;
  }

  // Spending bonus
  if (metrics.totalAmountSpent >= 100000) {
    score += 15;
  } else if (metrics.totalAmountSpent >= 50000) {
    score += 10;
  } else if (metrics.totalAmountSpent >= 10000) {
    score += 5;
  }

  // Cancellation rate impact
  if (metrics.cancellationRate <= 0.02) {
    score += 10;
  } else if (metrics.cancellationRate <= 0.05) {
    score += 5;
  } else if (metrics.cancellationRate > 0.15) {
    score -= 20;
    violations.push(`High cancellation rate: ${(metrics.cancellationRate * 100).toFixed(1)}%`);
    recommendations.push('Reduce order cancellations to improve your buyer score');
  } else if (metrics.cancellationRate > 0.10) {
    score -= 10;
    violations.push(`Elevated cancellation rate: ${(metrics.cancellationRate * 100).toFixed(1)}%`);
  }

  // Dispute behavior impact
  const disputeRatio = metrics.disputesInitiated > 0 
    ? metrics.disputesLost / metrics.disputesInitiated 
    : 0;
  
  if (metrics.disputesInitiated === 0) {
    score += 10; // No disputes is good
  } else if (disputeRatio > 0.5 && metrics.disputesInitiated >= 3) {
    score -= 15;
    violations.push(`High rate of lost disputes: ${(disputeRatio * 100).toFixed(0)}%`);
    recommendations.push('Review dispute reasons to avoid future issues');
  } else if (metrics.disputesInitiated > 5 && metrics.totalOrderCount < 20) {
    score -= 10;
    violations.push('Frequent dispute initiations relative to order count');
  }

  // On-time payment bonus
  if (metrics.onTimePaymentRate >= 0.95) {
    score += 10;
  } else if (metrics.onTimePaymentRate >= 0.85) {
    score += 5;
  } else if (metrics.onTimePaymentRate < 0.70) {
    score -= 15;
    violations.push(`Low on-time payment rate: ${(metrics.onTimePaymentRate * 100).toFixed(1)}%`);
    recommendations.push('Pay invoices on time to maintain good standing');
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
 * Determine buyer tier based on metrics
 */
export function determineBuyerTier(metrics: BuyerMetrics, complianceScore: number): BuyerTierName {
  const platinum = BUYER_TIER_THRESHOLDS.PLATINUM;
  const gold = BUYER_TIER_THRESHOLDS.GOLD;
  const silver = BUYER_TIER_THRESHOLDS.SILVER;

  // Check PLATINUM tier
  if (
    metrics.totalAmountSpent >= platinum.minTotalSpent &&
    metrics.totalOrderCount >= platinum.minOrderCount &&
    complianceScore >= platinum.minPaymentReliability &&
    metrics.cancellationRate <= platinum.maxCancellationRate
  ) {
    return 'PLATINUM';
  }

  // Check GOLD tier
  if (
    metrics.totalAmountSpent >= gold.minTotalSpent &&
    metrics.totalOrderCount >= gold.minOrderCount &&
    complianceScore >= gold.minPaymentReliability &&
    metrics.cancellationRate <= gold.maxCancellationRate
  ) {
    return 'GOLD';
  }

  // Check SILVER tier
  if (
    metrics.totalAmountSpent >= silver.minTotalSpent &&
    metrics.totalOrderCount >= silver.minOrderCount &&
    complianceScore >= silver.minPaymentReliability &&
    metrics.cancellationRate <= silver.maxCancellationRate
  ) {
    return 'SILVER';
  }

  // Default to BRONZE
  return 'BRONZE';
}

/**
 * Get current buyer tier from LoyaltyTier
 */
async function getCurrentBuyerTier(userId: string): Promise<BuyerTierName> {
  const loyaltyStatus = await prisma.buyerLoyaltyStatus.findUnique({
    where: { buyerId: userId },
    include: {
      currentTier: true,
    },
  });

  if (!loyaltyStatus?.currentTier) {
    return 'BRONZE';
  }

  // Map tier name to BuyerTierName
  const tierName = loyaltyStatus.currentTier.tierName.toUpperCase();
  if (['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].includes(tierName)) {
    return tierName as BuyerTierName;
  }
  
  return 'BRONZE';
}

/**
 * Full buyer tier assessment
 */
export async function assessBuyerTier(userId: string): Promise<BuyerTierAssessmentResult> {
  const currentTier = await getCurrentBuyerTier(userId);
  const metrics = await getBuyerMetrics(userId);
  const { complianceScore } = calculateBuyerComplianceScore(metrics);
  const proposedTier = determineBuyerTier(metrics, complianceScore);

  const shouldChangeTier = currentTier !== proposedTier;
  
  let changeReason = '';
  if (shouldChangeTier) {
    const tierOrder: BuyerTierName[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const proposedIndex = tierOrder.indexOf(proposedTier);
    
    if (proposedIndex > currentIndex) {
      changeReason = `Metrics improved: eligible for upgrade from ${currentTier} to ${proposedTier}`;
    } else {
      changeReason = `Metrics declined: recommended downgrade from ${currentTier} to ${proposedTier}`;
    }
  }

  return {
    currentTier,
    proposedTier,
    shouldChangeTier,
    changeReason,
    metrics,
    complianceScore,
  };
}

/**
 * Update buyer compliance record in database
 */
export async function updateBuyerComplianceRecord(
  userId: string,
  metrics: BuyerMetrics,
  assessment: ComplianceAssessmentResult
): Promise<void> {
  const now = new Date();
  
  await prisma.buyerComplianceRecord.upsert({
    where: { buyerId: userId },
    create: {
      buyerId: userId,
      paymentReliabilityScore: Math.round(metrics.onTimePaymentRate * 100),
      disputesInitiated: metrics.disputesInitiated,
      disputesWon: metrics.disputesWon,
      disputesLost: metrics.disputesLost,
      averagePaymentDays: metrics.averagePaymentDays,
      latePaymentCount: metrics.latePaymentCount,
      onTimePaymentRate: metrics.onTimePaymentRate,
      totalOrderCount: metrics.totalOrderCount,
      cancelledOrderCount: metrics.cancelledOrderCount,
      cancellationRate: metrics.cancellationRate,
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
      paymentReliabilityScore: Math.round(metrics.onTimePaymentRate * 100),
      disputesInitiated: metrics.disputesInitiated,
      disputesWon: metrics.disputesWon,
      disputesLost: metrics.disputesLost,
      averagePaymentDays: metrics.averagePaymentDays,
      latePaymentCount: metrics.latePaymentCount,
      onTimePaymentRate: metrics.onTimePaymentRate,
      totalOrderCount: metrics.totalOrderCount,
      cancelledOrderCount: metrics.cancelledOrderCount,
      cancellationRate: metrics.cancellationRate,
      complianceScore: assessment.complianceScore,
      riskLevel: assessment.riskLevel,
      isComplianceRisk: assessment.isComplianceRisk,
      lastScoreCalculation: now,
    },
  });
}

/**
 * Full buyer compliance assessment workflow
 */
export async function runBuyerComplianceAssessment(userId: string): Promise<{
  assessment: BuyerTierAssessmentResult;
  compliance: ComplianceAssessmentResult;
}> {
  const metrics = await getBuyerMetrics(userId);
  const compliance = calculateBuyerComplianceScore(metrics);
  const assessment = await assessBuyerTier(userId);
  
  await updateBuyerComplianceRecord(userId, metrics, compliance);
  
  return {
    assessment,
    compliance,
  };
}

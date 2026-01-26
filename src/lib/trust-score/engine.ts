import prisma from '@/lib/db';
import { RiskLevel, FlagType, FlagSeverity, AlertType } from '@prisma/client';

// Trust Score Calculation Engine
// Implements the algorithm as specified in the requirements

interface ScoreComponents {
  paymentReliabilityScore: number;
  disputeHistoryScore: number;
  behavioralScore: number;
  complianceScore: number;
  communicationScore: number;
}

interface ScoreResult extends ScoreComponents {
  overallScore: number;
  riskLevel: RiskLevel;
  riskCategory: string | null;
}

// Calculate Payment Reliability Score (0-100)
export function calculatePaymentReliabilityScore(metrics: {
  paymentOnTimePercentage: number;
  paymentLateCount: number;
  totalAmountPurchased: number;
}): number {
  let score = 50; // Base score
  
  // Payment on-time percentage (max 30 points)
  score += Math.min(30, metrics.paymentOnTimePercentage * 0.3);
  
  // Late payment penalty (max -20 points)
  score -= Math.min(20, metrics.paymentLateCount * 2);
  
  // Transaction volume bonus (max 20 points)
  const volumeBonus = (metrics.totalAmountPurchased / 10000) * 0.2;
  score += Math.min(20, volumeBonus);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Calculate Dispute History Score (0-100)
export function calculateDisputeHistoryScore(metrics: {
  totalDisputes: number;
  chargebackCount: number;
  chargebackRate: number;
  disputeWinRateSeller: number;
}): number {
  let score = 50; // Base score
  
  // Dispute penalty (max -30 points)
  score -= Math.min(30, metrics.totalDisputes * 5);
  
  // Chargeback penalty (max -50 points)
  score -= Math.min(50, metrics.chargebackCount * 10);
  
  // High chargeback rate penalty
  if (metrics.chargebackRate > 2) {
    score -= metrics.chargebackRate * 2;
  }
  
  // Seller win rate bonus (max 20 points)
  score += Math.min(20, metrics.disputeWinRateSeller * 0.5);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Calculate Behavioral Score (0-100)
export function calculateBehavioralScore(metrics: {
  returnRate: number;
  unreasonableReturnCount: number;
  positiveReviewRatio: number;
  communicationIssues: number;
}): number {
  let score = 50; // Base score
  
  // Return abuse penalty (if rate > 20%)
  if (metrics.returnRate > 20) {
    score -= (metrics.returnRate - 20) * 3;
  }
  
  // Unreasonable returns penalty
  score -= metrics.unreasonableReturnCount * 5;
  
  // Positive review bonus (max 30 points)
  score += Math.min(30, metrics.positiveReviewRatio * 30);
  
  // Communication issues penalty
  score -= metrics.communicationIssues * 2;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Calculate Compliance Score (0-100)
export function calculateComplianceScore(metrics: {
  missingDocumentation: number;
  kybVerificationIssues: number;
  kybVerified: boolean;
  sanctionsFlags: number;
}): number {
  let score = 50; // Base score
  
  // Missing documentation penalty
  score -= metrics.missingDocumentation * 10;
  
  // KYB issues penalty
  score -= metrics.kybVerificationIssues * 15;
  
  // KYB verified bonus
  if (metrics.kybVerified) {
    score += 20;
  }
  
  // Sanctions/blacklist penalty
  score -= metrics.sanctionsFlags * 30;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Calculate Overall Score and Risk Level
export function calculateOverallScore(components: ScoreComponents): ScoreResult {
  // Weighted average
  const overallScore = Math.round(
    components.paymentReliabilityScore * 0.35 +
    components.disputeHistoryScore * 0.30 +
    components.behavioralScore * 0.20 +
    components.complianceScore * 0.15
  );
  
  // Determine risk level (inverted - higher score = lower risk)
  let riskLevel: RiskLevel;
  if (overallScore >= 70) {
    riskLevel = RiskLevel.LOW; // GREEN
  } else if (overallScore >= 40) {
    riskLevel = RiskLevel.MEDIUM; // YELLOW
  } else {
    riskLevel = RiskLevel.HIGH; // RED
  }
  
  // Determine risk category based on lowest component
  let riskCategory: string | null = null;
  const componentScores = [
    { name: 'HIGH_PAYMENT_RISK', score: components.paymentReliabilityScore },
    { name: 'HIGH_DISPUTE_HISTORY', score: components.disputeHistoryScore },
    { name: 'BEHAVIORAL_CONCERNS', score: components.behavioralScore },
    { name: 'COMPLIANCE_ISSUES', score: components.complianceScore }
  ];
  
  const lowestComponent = componentScores.reduce((min, curr) => 
    curr.score < min.score ? curr : min
  );
  
  if (lowestComponent.score < 40) {
    riskCategory = lowestComponent.name;
  }
  
  return {
    ...components,
    overallScore,
    riskLevel,
    riskCategory
  };
}

// Main function to recalculate buyer's trust score
export async function recalculateBuyerTrustScore(buyerId: string): Promise<ScoreResult | null> {
  // Get buyer's transaction data
  const transactions = await prisma.transaction.findMany({
    where: { buyerId },
    include: { dispute: true }
  });
  
  // Get buyer's disputes
  const disputes = await prisma.dispute.findMany({
    where: { filedByUserId: buyerId }
  });
  
  // Get buyer's reviews
  const reviews = await prisma.review.findMany({
    where: { reviewedUserId: buyerId, status: 'APPROVED' }
  });
  
  // Get KYB status (if buyer has supplier profile)
  const kybProfile = await prisma.supplierKYB.findUnique({
    where: { userId: buyerId }
  });
  
  // Calculate metrics
  const totalTransactions = transactions.length;
  const successfulTransactions = transactions.filter(t => t.status === 'COMPLETED').length;
  
  // For simplicity, assume on-time if completed within expected delivery
  const paymentOnTimeCount = transactions.filter(t => 
    t.status === 'COMPLETED' && t.paymentStatus === 'SUCCEEDED'
  ).length;
  const paymentLateCount = totalTransactions - paymentOnTimeCount;
  
  const paymentOnTimePercentage = totalTransactions > 0 
    ? (paymentOnTimeCount / totalTransactions) * 100 
    : 100;
  
  const totalAmountPurchased = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalDisputes = disputes.length;
  const chargebackCount = 0; // Would need chargeback tracking
  const chargebackRate = totalTransactions > 0 ? (chargebackCount / totalTransactions) * 100 : 0;
  
  // Seller win rate = disputes where seller won
  const resolvedDisputes = disputes.filter(d => d.status === 'RESOLVED');
  const sellerWins = resolvedDisputes.filter(d => d.adminDecision === 'SELLER_FAVORED').length;
  const disputeWinRateSeller = resolvedDisputes.length > 0 
    ? (sellerWins / resolvedDisputes.length) * 100 
    : 0;
  
  // Returns (simplified - would need return tracking)
  const returnRate = 0;
  const unreasonableReturnCount = 0;
  
  // Reviews
  const positiveReviews = reviews.filter(r => r.overallRating >= 4).length;
  const positiveReviewRatio = reviews.length > 0 ? positiveReviews / reviews.length : 0.5;
  
  // Communication issues (simplified)
  const communicationIssues = 0;
  
  // KYB compliance
  const kybVerified = kybProfile?.status === 'VERIFIED';
  const kybVerificationIssues = kybProfile?.status === 'REJECTED' ? 1 : 0;
  
  // Calculate component scores
  const paymentReliabilityScore = calculatePaymentReliabilityScore({
    paymentOnTimePercentage,
    paymentLateCount,
    totalAmountPurchased
  });
  
  const disputeHistoryScore = calculateDisputeHistoryScore({
    totalDisputes,
    chargebackCount,
    chargebackRate,
    disputeWinRateSeller
  });
  
  const behavioralScore = calculateBehavioralScore({
    returnRate,
    unreasonableReturnCount,
    positiveReviewRatio,
    communicationIssues
  });
  
  const complianceScore = calculateComplianceScore({
    missingDocumentation: 0,
    kybVerificationIssues,
    kybVerified,
    sanctionsFlags: 0
  });
  
  const communicationScore = 50; // Default
  
  const result = calculateOverallScore({
    paymentReliabilityScore,
    disputeHistoryScore,
    behavioralScore,
    complianceScore,
    communicationScore
  });
  
  // Update or create trust score record
  const existingScore = await prisma.buyerTrustScore.findUnique({
    where: { buyerId }
  });
  
  const previousScore = existingScore?.overallScore ?? 50;
  const scoreDelta = result.overallScore - previousScore;
  
  const trustScore = await prisma.buyerTrustScore.upsert({
    where: { buyerId },
    create: {
      buyerId,
      ...result,
      totalTransactions,
      successfulTransactions,
      paymentOnTimeCount,
      paymentLateCount,
      paymentOnTimePercentage,
      totalAmountPurchased,
      totalDisputes,
      openDisputes: disputes.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW').length,
      resolvedDisputes: resolvedDisputes.length,
      disputesInitiated: totalDisputes,
      chargebackCount,
      chargebackRate,
      disputeWinRateBuyer: 100 - disputeWinRateSeller,
      disputeWinRateSeller,
      returnRate,
      unreasonableReturnCount,
      lastTransactionAt: transactions[0]?.createdAt,
      lastDisputeAt: disputes[0]?.createdAt,
      scoreLastUpdatedAt: new Date()
    },
    update: {
      ...result,
      totalTransactions,
      successfulTransactions,
      paymentOnTimeCount,
      paymentLateCount,
      paymentOnTimePercentage,
      totalAmountPurchased,
      totalDisputes,
      openDisputes: disputes.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW').length,
      resolvedDisputes: resolvedDisputes.length,
      chargebackCount,
      chargebackRate,
      disputeWinRateBuyer: 100 - disputeWinRateSeller,
      disputeWinRateSeller,
      scoreVersion: { increment: 1 },
      scoreLastUpdatedAt: new Date()
    }
  });
  
  // Record score history if there was a change
  if (scoreDelta !== 0) {
    await prisma.buyerScoreHistory.create({
      data: {
        trustScoreId: trustScore.id,
        overallScore: result.overallScore,
        paymentReliabilityScore: result.paymentReliabilityScore,
        disputeHistoryScore: result.disputeHistoryScore,
        behavioralScore: result.behavioralScore,
        complianceScore: result.complianceScore,
        riskLevel: result.riskLevel,
        changeReason: 'RECALCULATION',
        scoreDelta,
        previousScore,
        newScore: result.overallScore
      }
    });
    
    // Create alert if significant score drop
    if (scoreDelta <= -15) {
      await createBuyerAlert(trustScore.id, AlertType.SCORE_DROP, FlagSeverity.HIGH, 
        `Buyer trust score dropped by ${Math.abs(scoreDelta)} points`);
    }
  }
  
  return result;
}

// Create a risk flag for a buyer
export async function createRiskFlag(
  buyerId: string,
  flagType: FlagType,
  severity: FlagSeverity,
  description: string,
  context?: { transactionId?: string; disputeId?: string; relatedData?: any }
): Promise<void> {
  // Get or create trust score
  let trustScore = await prisma.buyerTrustScore.findUnique({
    where: { buyerId }
  });
  
  if (!trustScore) {
    await recalculateBuyerTrustScore(buyerId);
    trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId }
    });
  }
  
  if (!trustScore) return;
  
  // Create the flag
  await prisma.buyerRiskFlag.create({
    data: {
      trustScoreId: trustScore.id,
      flagType,
      severity,
      description,
      transactionId: context?.transactionId,
      disputeId: context?.disputeId,
      relatedData: context?.relatedData ? JSON.stringify(context.relatedData) : null
    }
  });
  
  // Update last flag timestamp
  await prisma.buyerTrustScore.update({
    where: { id: trustScore.id },
    data: { lastFlagAt: new Date() }
  });
  
  // Create alert for new flag
  await createBuyerAlert(trustScore.id, AlertType.NEW_FLAG, severity,
    `New ${severity} risk flag: ${flagType}`);
  
  // Recalculate score after flag
  await recalculateBuyerTrustScore(buyerId);
}

// Create buyer alert
async function createBuyerAlert(
  trustScoreId: string,
  alertType: AlertType,
  severity: FlagSeverity,
  message: string
): Promise<void> {
  // Get sellers who have transacted with this buyer
  const trustScore = await prisma.buyerTrustScore.findUnique({
    where: { id: trustScoreId },
    select: { buyerId: true }
  });
  
  if (!trustScore) return;
  
  const transactions = await prisma.transaction.findMany({
    where: { buyerId: trustScore.buyerId },
    select: { supplierId: true }
  });
  
  const sellerIds = Array.from(new Set(transactions.map(t => t.supplierId)));
  
  await prisma.buyerAlert.create({
    data: {
      trustScoreId,
      alertType,
      severity,
      message,
      sellerIds,
      adminNotified: severity === FlagSeverity.CRITICAL || severity === FlagSeverity.HIGH
    }
  });
}

// Check for automatic flag triggers
export async function checkAutoFlagTriggers(buyerId: string, event: {
  type: 'TRANSACTION_COMPLETED' | 'DISPUTE_CREATED' | 'CHARGEBACK' | 'PAYMENT_OVERDUE';
  transactionId?: string;
  disputeId?: string;
}): Promise<void> {
  const trustScore = await prisma.buyerTrustScore.findUnique({
    where: { buyerId },
    include: { flags: { where: { status: 'ACTIVE' } } }
  });
  
  if (!trustScore) return;
  
  // Payment delay > 30 days
  if (event.type === 'PAYMENT_OVERDUE') {
    await createRiskFlag(buyerId, FlagType.PAYMENT_DELAY, FlagSeverity.HIGH,
      'Payment is more than 30 days overdue',
      { transactionId: event.transactionId });
  }
  
  // Chargeback initiated
  if (event.type === 'CHARGEBACK') {
    await createRiskFlag(buyerId, FlagType.CHARGEBACK, FlagSeverity.CRITICAL,
      'Buyer initiated a chargeback',
      { transactionId: event.transactionId });
    
    // Check for multiple chargebacks
    if (trustScore.chargebackCount >= 2) {
      await createRiskFlag(buyerId, FlagType.FRAUD_SUSPICION, FlagSeverity.CRITICAL,
        'Multiple chargebacks detected - possible fraud',
        { transactionId: event.transactionId });
    }
  }
  
  // High dispute rate (>3 in 30 days)
  if (event.type === 'DISPUTE_CREATED') {
    const recentDisputes = await prisma.dispute.count({
      where: {
        filedByUserId: buyerId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });
    
    if (recentDisputes > 3) {
      await createRiskFlag(buyerId, FlagType.HIGH_DISPUTE_RATE, FlagSeverity.HIGH,
        `${recentDisputes} disputes in the last 30 days`,
        { disputeId: event.disputeId });
    }
  }
  
  // Recalculate score after events
  await recalculateBuyerTrustScore(buyerId);
}

// Get risk level color for display
export function getRiskLevelColor(riskLevel: RiskLevel): { bg: string; text: string; label: string } {
  switch (riskLevel) {
    case RiskLevel.LOW:
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Risk' };
    case RiskLevel.MEDIUM:
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Risk' };
    case RiskLevel.HIGH:
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
  }
}

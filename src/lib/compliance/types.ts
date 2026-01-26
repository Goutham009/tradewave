// =============================================================================
// PHASE 9: COMPLIANCE & TIER SYSTEM TYPES
// =============================================================================

// Tier definitions
export type SupplierTierName = 'TRUSTED' | 'STANDARD' | 'REVIEW';
export type BuyerTierName = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TierChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ON_HOLD' | 'INVESTIGATING';

// Supplier tier thresholds (visibility-based)
export const SUPPLIER_TIER_THRESHOLDS: Record<SupplierTierName, {
  minTransactionCount: number;
  minAverageRating: number;
  minCompletionRate: number;
  minComplianceScore: number;
  maxDisputeRate: number;
  maxReturnRate: number;
  visibilityMultiplier: number;
  displayName: string;
  badgeColor: string;
}> = {
  TRUSTED: {
    minTransactionCount: 50,
    minAverageRating: 4.5,
    minCompletionRate: 0.95,
    minComplianceScore: 80,
    maxDisputeRate: 0.02,
    maxReturnRate: 0.05,
    visibilityMultiplier: 1.5,
    displayName: 'Trusted Supplier',
    badgeColor: '#22C55E', // green
  },
  STANDARD: {
    minTransactionCount: 10,
    minAverageRating: 3.5,
    minCompletionRate: 0.85,
    minComplianceScore: 50,
    maxDisputeRate: 0.05,
    maxReturnRate: 0.10,
    visibilityMultiplier: 1.0,
    displayName: 'Standard Supplier',
    badgeColor: '#3B82F6', // blue
  },
  REVIEW: {
    minTransactionCount: 0,
    minAverageRating: 0,
    minCompletionRate: 0,
    minComplianceScore: 0,
    maxDisputeRate: 1.0,
    maxReturnRate: 1.0,
    visibilityMultiplier: 0.5,
    displayName: 'Under Review',
    badgeColor: '#EF4444', // red
  },
};

// Buyer tier thresholds (spending-based)
export const BUYER_TIER_THRESHOLDS: Record<BuyerTierName, {
  minTotalSpent: number;
  minOrderCount: number;
  minPaymentReliability: number;
  maxCancellationRate: number;
  discountPercentage: number;
  displayName: string;
  badgeColor: string;
}> = {
  PLATINUM: {
    minTotalSpent: 100000,
    minOrderCount: 50,
    minPaymentReliability: 95,
    maxCancellationRate: 0.02,
    discountPercentage: 10,
    displayName: 'Platinum Buyer',
    badgeColor: '#A855F7', // purple
  },
  GOLD: {
    minTotalSpent: 50000,
    minOrderCount: 25,
    minPaymentReliability: 90,
    maxCancellationRate: 0.05,
    discountPercentage: 7,
    displayName: 'Gold Buyer',
    badgeColor: '#F59E0B', // amber
  },
  SILVER: {
    minTotalSpent: 10000,
    minOrderCount: 10,
    minPaymentReliability: 80,
    maxCancellationRate: 0.10,
    discountPercentage: 5,
    displayName: 'Silver Buyer',
    badgeColor: '#6B7280', // gray
  },
  BRONZE: {
    minTotalSpent: 0,
    minOrderCount: 0,
    minPaymentReliability: 0,
    maxCancellationRate: 1.0,
    discountPercentage: 0,
    displayName: 'Bronze Buyer',
    badgeColor: '#92400E', // brown
  },
};

// Metrics interfaces
export interface SupplierMetrics {
  transactionCount: number;
  completedTransactions: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  disputeCount: number;
  disputeRate: number;
  returnCount: number;
  returnRate: number;
  kybStatus: string;
  kybVerified: boolean;
  kybExpired: boolean;
}

export interface BuyerMetrics {
  totalOrderCount: number;
  totalAmountSpent: number;
  cancelledOrderCount: number;
  cancellationRate: number;
  disputesInitiated: number;
  disputesWon: number;
  disputesLost: number;
  averagePaymentDays: number;
  latePaymentCount: number;
  onTimePaymentRate: number;
}

export interface ComplianceAssessmentResult {
  complianceScore: number;
  riskLevel: RiskLevel;
  isComplianceRisk: boolean;
  violations: string[];
  recommendations: string[];
}

export interface SupplierTierAssessmentResult {
  currentTier: SupplierTierName;
  proposedTier: SupplierTierName;
  shouldChangeTier: boolean;
  changeReason: string;
  metrics: SupplierMetrics;
  complianceScore: number;
  visibilityMultiplier: number;
}

export interface BuyerTierAssessmentResult {
  currentTier: BuyerTierName;
  proposedTier: BuyerTierName;
  shouldChangeTier: boolean;
  changeReason: string;
  metrics: BuyerMetrics;
  complianceScore: number;
}

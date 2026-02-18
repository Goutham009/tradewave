import { prisma } from '@/lib/prisma';

export interface GoodStandingCheck {
  goodStanding: boolean;
  checks: {
    hasUnpaidOrders: boolean;
    hasUnresolvedDisputes: boolean;
    withinTransactionLimit: boolean;
    goodPaymentHistory: boolean;
    noRecentAdverseEvents: boolean;
  };
  metrics: {
    onTimePaymentRatio: number;
    totalOrders: number;
    completedOrders: number;
    outstandingEscrow: number;
    transactionLimit: number;
    totalSpent: number;
  };
  recommendedAction: 'APPROVE' | 'MANUAL_REVIEW';
  reasons: string[];
}

export async function checkBuyerGoodStanding(buyerId: string): Promise<GoodStandingCheck> {
  // Fetch buyer data
  const buyer = await prisma.user.findUnique({
    where: { id: buyerId },
    select: {
      id: true,
      name: true,
      transactionLimit: true,
      totalOrderCount: true,
      totalSpent: true,
      onTimePaymentRatio: true,
      goodStanding: true,
    } as any,
  });

  if (!buyer) {
    return {
      goodStanding: false,
      checks: {
        hasUnpaidOrders: true,
        hasUnresolvedDisputes: true,
        withinTransactionLimit: false,
        goodPaymentHistory: false,
        noRecentAdverseEvents: false,
      },
      metrics: {
        onTimePaymentRatio: 0,
        totalOrders: 0,
        completedOrders: 0,
        outstandingEscrow: 0,
        transactionLimit: 0,
        totalSpent: 0,
      },
      recommendedAction: 'MANUAL_REVIEW',
      reasons: ['Buyer not found'],
    };
  }

  // Fetch all transactions
  const transactions = await prisma.transaction.findMany({
    where: { buyerId },
    select: { id: true, status: true, amount: true, paymentStatus: true, createdAt: true },
  });

  // Fetch open/unresolved disputes
  const disputes = await prisma.dispute.findMany({
    where: {
      filedByUserId: buyerId,
      status: { in: ['PENDING', 'UNDER_REVIEW', 'ESCALATED'] },
    },
    select: { id: true, status: true },
  });

  // Fetch outstanding escrow (held or pending escrows for active transactions)
  const escrows = await prisma.escrowTransaction.findMany({
    where: {
      transaction: { buyerId },
      status: { in: ['PENDING', 'PENDING_PAYMENT', 'FUNDS_HELD', 'HELD'] as any[] },
    },
    select: { amount: true },
  });

  // Fetch payments
  const payments = await prisma.payment.findMany({
    where: {
      transaction: { buyerId },
    },
    select: { status: true, createdAt: true, paidAt: true },
  });

  // Calculate metrics
  const totalOrders = transactions.length;
  const completedOrders = transactions.filter(t => t.status === 'COMPLETED').length;

  // Calculate on-time payment ratio based on payment status
  const completedPayments = payments.filter(p => p.status === 'SUCCEEDED');
  const failedPayments = payments.filter(p => p.status === 'FAILED');
  const onTimePaymentRatio = payments.length > 0
    ? completedPayments.length / payments.length
    : 1.0; // Default to 1.0 if no payments yet

  // Outstanding escrow amount
  const outstandingEscrow = escrows.reduce(
    (sum, e) => sum + Number(e.amount || 0), 0
  );

  const transactionLimit = Number(buyer.transactionLimit || 10000000); // Default $10M limit
  const totalSpent = Number(buyer.totalSpent || 0);

  // Check for unpaid orders (transactions stuck in payment-pending states)
  const hasUnpaidOrders = transactions.some(
    t => t.status === 'INITIATED' && 
      new Date(t.createdAt || Date.now()).getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000 // >30 days old
  );

  // Check for unresolved disputes
  const hasUnresolvedDisputes = disputes.length > 0;

  // Check within transaction limit
  const withinTransactionLimit = outstandingEscrow < transactionLimit;

  // Good payment history (90%+ on-time)
  const goodPaymentHistory = onTimePaymentRatio >= 0.9;

  // Check recent adverse events (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentCancellations = transactions.filter(
    t => t.status === 'CANCELLED'
  ).length;
  const noRecentAdverseEvents = recentCancellations < 3;

  // Determine good standing
  const reasons: string[] = [];
  if (hasUnpaidOrders) reasons.push('Has unpaid/overdue orders');
  if (hasUnresolvedDisputes) reasons.push('Has unresolved disputes');
  if (!withinTransactionLimit) reasons.push('Outstanding escrow exceeds transaction limit');
  if (!goodPaymentHistory) reasons.push('On-time payment ratio below 90%');
  if (!noRecentAdverseEvents) reasons.push('Multiple recent cancellations');

  const goodStanding =
    !hasUnpaidOrders &&
    !hasUnresolvedDisputes &&
    withinTransactionLimit &&
    goodPaymentHistory &&
    noRecentAdverseEvents;

  // Update buyer's good standing record
  await prisma.user.update({
    where: { id: buyerId },
    data: {
      goodStanding,
      goodStandingCheckedAt: new Date(),
      onTimePaymentRatio,
      totalOrderCount: totalOrders,
    } as any,
  });

  return {
    goodStanding,
    checks: {
      hasUnpaidOrders,
      hasUnresolvedDisputes,
      withinTransactionLimit,
      goodPaymentHistory,
      noRecentAdverseEvents,
    },
    metrics: {
      onTimePaymentRatio,
      totalOrders,
      completedOrders,
      outstandingEscrow,
      transactionLimit,
      totalSpent,
    },
    recommendedAction: goodStanding ? 'APPROVE' : 'MANUAL_REVIEW',
    reasons,
  };
}

export async function getBuyerStats(buyerId: string) {
  const [transactions, reviews, favorites] = await Promise.all([
    prisma.transaction.findMany({
      where: { buyerId },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
        quotation: {
          select: {
            requirement: {
              select: { title: true, category: true },
            },
            supplier: {
              select: { id: true, name: true, companyName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { reviewerUserId: buyerId },
      select: { overallRating: true },
    }),
    prisma.buyerFavorite.findMany({
      where: { buyerId, favoriteType: 'SUPPLIER' },
      select: {
        displayName: true,
        supplierId: true,
        supplier: {
          select: { name: true, avatar: true },
        },
      },
    }),
  ]);

  const activeOrders = transactions.filter(
    t => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(t.status)
  ).length;
  const totalOrders = transactions.length;
  const totalSpent = transactions
    .filter(t => t.status !== 'CANCELLED')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
    : 0;

  return {
    activeOrders,
    totalOrders,
    totalSpent,
    avgRating: Math.round(avgRating * 10) / 10,
    favoriteSuppliers: favorites,
    recentTransactions: transactions.slice(0, 10),
  };
}

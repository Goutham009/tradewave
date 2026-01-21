import { NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/api/requireAdmin';
import { successResponse, errorResponse } from '@/lib/api/errorHandler';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    // Get user counts by role
    const [totalUsers, buyerCount, supplierCount, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);
    
    // Get transaction statistics
    const transactions = await prisma.transaction.findMany({
      select: {
        status: true,
        amount: true,
      },
    });
    
    const activeTransactions = transactions.filter(t => 
      ['INITIATED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'ESCROW_HELD', 'PRODUCTION', 'QUALITY_CHECK', 'SHIPPED', 'IN_TRANSIT'].includes(t.status)
    ).length;
    
    const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
    const disputedTransactions = transactions.filter(t => t.status === 'DISPUTED').length;
    
    const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const completedVolume = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Revenue is 2.5% of completed transactions
    const revenue = completedVolume * 0.025;
    
    // Average transaction value
    const avgTransactionValue = transactions.length > 0 
      ? totalVolume / transactions.length 
      : 0;
    
    // Get requirement stats
    const [totalRequirements, activeRequirements] = await Promise.all([
      prisma.requirement.count(),
      prisma.requirement.count({ 
        where: { 
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'SOURCING', 'QUOTATIONS_READY', 'NEGOTIATING'] } 
        } 
      }),
    ]);
    
    // Get quotation stats
    const [totalQuotations, pendingQuotations] = await Promise.all([
      prisma.quotation.count(),
      prisma.quotation.count({ where: { status: 'PENDING' } }),
    ]);
    
    // Get shipment stats (using any to handle new model)
    let shipmentStats = { total: 0, inTransit: 0, delivered: 0 };
    try {
      const shipments = await (prisma as any).shipment.findMany({
        select: { status: true },
      });
      shipmentStats = {
        total: shipments.length,
        inTransit: shipments.filter((s: any) => s.status === 'IN_TRANSIT').length,
        delivered: shipments.filter((s: any) => s.status === 'DELIVERED').length,
      };
    } catch (e) {
      // Shipment model may not exist yet
    }
    
    // Get recent activity count (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivityCount = await prisma.activity.count({
      where: { createdAt: { gte: oneDayAgo } },
    });
    
    const stats = {
      users: {
        total: totalUsers,
        buyers: buyerCount,
        suppliers: supplierCount,
        admins: adminCount,
      },
      transactions: {
        total: transactions.length,
        active: activeTransactions,
        completed: completedTransactions.length,
        disputed: disputedTransactions,
      },
      financial: {
        totalVolume,
        completedVolume,
        revenue,
        avgTransactionValue,
        currency: 'USD',
      },
      requirements: {
        total: totalRequirements,
        active: activeRequirements,
      },
      quotations: {
        total: totalQuotations,
        pending: pendingQuotations,
      },
      shipments: shipmentStats,
      activity: {
        last24Hours: recentActivityCount,
      },
    };
    
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}

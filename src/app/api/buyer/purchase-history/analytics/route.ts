import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/purchase-history/analytics - Get purchase analytics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyerId = session.user.id;

    // Get or create analytics record
    let analytics = await prisma.purchaseAnalytics.findUnique({
      where: { buyerId }
    });

    if (!analytics) {
      // Calculate analytics from purchase history
      const purchases = await prisma.purchaseHistory.findMany({
        where: { buyerId },
        orderBy: { orderedAt: 'asc' }
      });

      const totalOrders = purchases.length;
      const totalSpent = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Calculate repeat metrics
      const productCounts: Record<string, number> = {};
      purchases.forEach(p => {
        const key = `${p.supplierId}-${p.productName}`;
        productCounts[key] = (productCounts[key] || 0) + 1;
      });
      const repeatPurchases = Object.values(productCounts).filter(c => c > 1).length;
      const repeatBuyerRate = totalOrders > 0 ? (repeatPurchases / totalOrders) * 100 : 0;

      // Top suppliers
      const supplierCounts: Record<string, number> = {};
      purchases.forEach(p => {
        supplierCounts[p.supplierId] = (supplierCounts[p.supplierId] || 0) + Number(p.totalAmount);
      });
      const topRepeatSuppliers = Object.entries(supplierCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      // Top categories
      const categoryCounts: Record<string, number> = {};
      purchases.forEach(p => {
        categoryCounts[p.productCategory] = (categoryCounts[p.productCategory] || 0) + Number(p.totalAmount);
      });
      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => cat);

      // Calculate time-based metrics
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      const lastMonthPurchases = purchases.filter(p => p.orderedAt >= oneMonthAgo);
      const lastQuarterPurchases = purchases.filter(p => p.orderedAt >= threeMonthsAgo);

      const lastMonthSpending = lastMonthPurchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);
      const lastQuarterSpending = lastQuarterPurchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);

      // Churn risk calculation
      const lastOrder = purchases[purchases.length - 1];
      const daysSinceLastOrder = lastOrder 
        ? Math.floor((now.getTime() - lastOrder.orderedAt.getTime()) / (24 * 60 * 60 * 1000))
        : null;

      let churnRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (daysSinceLastOrder !== null) {
        if (daysSinceLastOrder > 90) churnRisk = 'HIGH';
        else if (daysSinceLastOrder > 45) churnRisk = 'MEDIUM';
      }

      // Unique suppliers
      const uniqueSuppliers = new Set(purchases.map(p => p.supplierId)).size;

      analytics = await prisma.purchaseAnalytics.create({
        data: {
          buyerId,
          totalOrders,
          totalSpent,
          averageOrderValue,
          repeatBuyerRate,
          topRepeatSuppliers,
          topCategories,
          categoryDistribution: JSON.stringify(categoryCounts),
          firstOrderDate: purchases[0]?.orderedAt || null,
          lastOrderDate: lastOrder?.orderedAt || null,
          totalSuppliers: uniqueSuppliers,
          preferredSuppliers: topRepeatSuppliers,
          churnRisk,
          daysSinceLastOrder,
          lastMonthSpending,
          lastQuarterSpending
        }
      });
    }

    // Get supplier details for top suppliers
    const supplierDetails = await prisma.user.findMany({
      where: { id: { in: analytics.topRepeatSuppliers } },
      select: {
        id: true,
        name: true,
        companyName: true,
        avatar: true
      }
    });

    return NextResponse.json({
      analytics: {
        ...analytics,
        topRepeatSuppliersDetails: supplierDetails
      }
    });
  } catch (error) {
    console.error('Error fetching purchase analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase analytics' },
      { status: 500 }
    );
  }
}

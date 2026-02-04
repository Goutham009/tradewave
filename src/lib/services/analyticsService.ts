import prisma from '@/lib/db';

export interface DashboardStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  transactions: {
    total: number;
    completed: number;
    pending: number;
    successRate: number;
  };
  users: {
    total: number;
    buyers: number;
    suppliers: number;
    newThisMonth: number;
  };
  averageTransactionValue: number;
  topCategories: Array<{ category: string; count: number; value: number }>;
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Revenue calculations
  const [thisMonthRevenue, lastMonthRevenue, totalRevenue] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: firstDayThisMonth },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: firstDayLastMonth,
          lt: firstDayThisMonth,
        },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  const thisMonth = thisMonthRevenue._sum.amount?.toNumber() || 0;
  const lastMonth = lastMonthRevenue._sum.amount?.toNumber() || 0;
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Transaction stats
  const [totalTrans, completedTrans, pendingTrans] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.transaction.count({
      where: { status: { in: ['PAYMENT_PENDING', 'PRODUCTION'] } },
    }),
  ]);

  const successRate = totalTrans > 0 ? (completedTrans / totalTrans) * 100 : 0;

  // User stats
  const [totalUsers, buyers, suppliers, newUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'BUYER' } }),
    prisma.user.count({ where: { role: 'SUPPLIER' } }),
    prisma.user.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
  ]);

  // Average transaction value
  const avgValue = await prisma.transaction.aggregate({
    where: { status: 'COMPLETED' },
    _avg: { amount: true },
  });

  // Top categories - simplified query
  const topCategories = await prisma.requirement.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
    take: 5,
  });

  return {
    revenue: {
      total: totalRevenue._sum.amount?.toNumber() || 0,
      thisMonth,
      lastMonth,
      growth,
    },
    transactions: {
      total: totalTrans,
      completed: completedTrans,
      pending: pendingTrans,
      successRate,
    },
    users: {
      total: totalUsers,
      buyers,
      suppliers,
      newThisMonth: newUsers,
    },
    averageTransactionValue: avgValue._avg.amount?.toNumber() || 0,
    topCategories: topCategories.map((tc: any) => ({
      category: tc.category,
      count: typeof tc._count === 'number' ? tc._count : 0,
      value: 0,
    })),
  };
}

/**
 * Get seller analytics
 */
export async function getSellerAnalytics(sellerId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, quotes, revenue, ratingStats] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        quotation: {
          userId: sellerId,
        },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.quotation.count({
      where: {
        userId: sellerId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.transaction.aggregate({
      where: {
        quotation: {
          userId: sellerId,
        },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    }),
    prisma.userRatingStats.findUnique({
      where: { userId: sellerId },
    }),
  ]);

  // Group transactions by day for chart
  const dailyData = transactions.reduce((acc, tx) => {
    const date = tx.createdAt.toISOString().split('T')[0];
    if (!acc[date]) acc[date] = { count: 0, value: 0 };
    acc[date].count++;
    acc[date].value += tx.amount.toNumber();
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  return {
    totalRevenue: revenue._sum.amount?.toNumber() || 0,
    averageRating: Number(ratingStats?.averageRating) || 0,
    totalReviews: ratingStats?.totalReviews || 0,
    quotesSubmitted: quotes,
    recentTransactions: transactions,
    dailyData: Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    })),
  };
}

/**
 * Get buyer analytics
 */
export async function getBuyerAnalytics(buyerId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [transactions, requirements, spending] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        buyerId,
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.requirement.count({
      where: {
        buyerId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.transaction.aggregate({
      where: {
        buyerId,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalSpending: spending._sum.amount?.toNumber() || 0,
    requirementsPosted: requirements,
    recentTransactions: transactions,
    transactionCount: transactions.length,
  };
}

/**
 * Get time series data for charts
 */
export async function getTimeSeriesData(
  metric: 'transactions' | 'revenue' | 'users',
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data: Array<{ date: string; value: number }> = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    let value = 0;

    switch (metric) {
      case 'transactions':
        value = await prisma.transaction.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        });
        break;
      case 'revenue':
        const result = await prisma.transaction.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
          _sum: { amount: true },
        });
        value = result._sum.amount?.toNumber() || 0;
        break;
      case 'users':
        value = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        });
        break;
    }

    data.push({
      date: date.toISOString().split('T')[0],
      value,
    });
  }

  return data;
}

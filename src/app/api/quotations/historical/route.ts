import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');

    // In production, fetch from database with proper date filtering
    // const startDate = new Date();
    // startDate.setDate(startDate.getDate() - period);
    // const quotations = await prisma.quotation.findMany({
    //   where: {
    //     supplierId: session.user.id,
    //     createdAt: { gte: startDate },
    //   },
    // });

    // Mock data for demo
    const mockQuotations = [
      {
        id: 'q-001',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        productType: 'Industrial Sensors',
        totalPrice: 45000,
        status: 'ACCEPTED',
      },
      {
        id: 'q-002',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        productType: 'LED Display Panels',
        totalPrice: 32000,
        status: 'PENDING',
      },
      {
        id: 'q-003',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        productType: 'Steel Components',
        totalPrice: 18500,
        status: 'REJECTED',
      },
      {
        id: 'q-004',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        productType: 'Electronic Parts',
        totalPrice: 56000,
        status: 'ACCEPTED',
      },
      {
        id: 'q-005',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        productType: 'Packaging Materials',
        totalPrice: 12000,
        status: 'EXPIRED',
      },
      {
        id: 'q-006',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        productType: 'Industrial Valves',
        totalPrice: 28000,
        status: 'ACCEPTED',
      },
    ];

    // Filter by period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const filteredQuotations = mockQuotations.filter(
      q => new Date(q.createdAt) >= startDate
    );

    // Calculate metrics
    const totalQuotations = filteredQuotations.length;
    const acceptedQuotations = filteredQuotations.filter(q => q.status === 'ACCEPTED').length;
    const winRate = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;
    
    const totalValue = filteredQuotations.reduce((sum, q) => sum + q.totalPrice, 0);
    const avgQuoteValue = totalQuotations > 0 ? totalValue / totalQuotations : 0;

    // Mock trend data (in production, compare with previous period)
    const trends = {
      quotationsChange: 12.5,
      winRateChange: 5.2,
      avgValueChange: -3.1,
    };

    return NextResponse.json({
      totalQuotations,
      winRate,
      avgQuoteValue,
      totalValue,
      recentQuotations: filteredQuotations,
      trends,
    });
  } catch (error) {
    console.error('Historical data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}

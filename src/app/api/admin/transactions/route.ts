import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ status: 'error', error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          buyer: {
            select: { name: true, email: true, companyName: true },
          },
          supplier: {
            select: { companyName: true, email: true },
          },
          requirement: {
            select: { title: true, category: true },
          },
          escrow: {
            select: { status: true, amount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate stats
    const allTransactions = await prisma.transaction.findMany({
      select: { status: true, amount: true },
    });

    const stats = {
      total: allTransactions.length,
      pending: allTransactions.filter(t => ['INITIATED', 'PAYMENT_PENDING', 'ESCROW_HELD'].includes(t.status)).length,
      completed: allTransactions.filter(t => t.status === 'COMPLETED').length,
      disputed: allTransactions.filter(t => t.status === 'DISPUTED').length,
      totalValue: allTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
    };

    // Transform for response
    const transformedTransactions = transactions.map((t: any) => ({
      id: t.id,
      buyerName: t.buyer?.name || t.buyer?.companyName || 'Unknown',
      supplierName: t.supplier?.companyName || 'Unknown',
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      escrowStatus: t.escrow?.status || 'PENDING',
      createdAt: t.createdAt,
      requirementTitle: t.requirement?.title || 'N/A',
    }));

    return successResponse({
      transactions: transformedTransactions,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return errorResponse('Internal server error', 500);
  }
}

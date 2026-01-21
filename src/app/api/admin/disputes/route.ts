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
    const status = searchParams.get('status');

    // Fetch disputed transactions
    const where: any = {
      status: 'DISPUTED',
    };

    const disputedTransactions = await prisma.transaction.findMany({
      where,
      include: {
        buyer: {
          select: { name: true, companyName: true },
        },
        supplier: {
          select: { companyName: true },
        },
        requirement: {
          select: { title: true },
        },
        escrow: {
          select: { amount: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform to dispute format
    const disputes = disputedTransactions.map((t: any, index: number) => ({
      id: `DSP-${String(index + 1).padStart(3, '0')}`,
      transactionId: t.id,
      buyerName: t.buyer?.name || t.buyer?.companyName || 'Unknown',
      supplierName: t.supplier?.companyName || 'Unknown',
      amount: Number(t.escrow?.amount || t.amount),
      currency: t.currency,
      reason: t.disputeReason || 'Dispute raised by buyer',
      status: 'OPEN', // Could be stored in a separate Dispute model
      priority: Number(t.amount) > 50000 ? 'HIGH' : 'MEDIUM',
      createdAt: t.updatedAt,
      updatedAt: t.updatedAt,
      requirementTitle: t.requirement?.title || 'N/A',
    }));

    return successResponse({ disputes });
  } catch (error) {
    console.error('Failed to fetch disputes:', error);
    return errorResponse('Internal server error', 500);
  }
}

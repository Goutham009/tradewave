import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = params.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        quotation: true,
        escrow: true,
        shipment: true,
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check authorization
    const userId = session.user.id;
    const userRole = session.user.role;
    
    if (
      transaction.buyerId !== userId &&
      transaction.supplierId !== userId &&
      !['ADMIN', 'ACCOUNT_MANAGER'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build milestone data from transaction and related records
    const milestoneData = {
      quotationAcceptedAt: transaction.createdAt,
      contractGeneratedAt: transaction.escrow?.createdAt,
      contractTxHash: transaction.escrow?.transactionHash,
      paymentDepositedAt: transaction.escrow?.depositedAt,
      depositTxHash: transaction.escrow?.depositTxHash,
      amount: transaction.escrow?.amount ? Number(transaction.escrow.amount) : Number(transaction.amount),
      currency: transaction.escrow?.currency || transaction.currency,
      shipmentStartedAt: transaction.shipment?.createdAt || transaction.shipmentDate,
      customsClearedAt: transaction.shipment?.customsClearedAt,
      deliveryConfirmedAt: transaction.deliveryConfirmedAt,
      paymentReleasedAt: transaction.escrow?.releasedAt || transaction.fundsReleasedAt,
      releaseTxHash: transaction.escrow?.releaseTxHash || transaction.releaseTransactionId,
    };

    return NextResponse.json(milestoneData);
  } catch (error) {
    console.error('Milestones fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

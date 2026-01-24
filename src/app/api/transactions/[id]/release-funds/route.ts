import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

const PLATFORM_FEE_RATE = 0.02; // 2% platform fee

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = params.id;
    const body = await request.json().catch(() => ({}));
    const { reason, forceRelease } = body;

    // Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        supplier: true,
        buyer: true,
        requirement: true,
        escrow: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if already released
    if (transaction.fundsReleasedAt) {
      return NextResponse.json(
        { error: 'Funds have already been released' },
        { status: 400 }
      );
    }

    // Check authorization - admin can force release, system can auto-release
    const isAdmin = session.user.role === 'ADMIN';
    const isAutoRelease = reason === 'auto-release';
    
    if (!isAdmin && !isAutoRelease) {
      return NextResponse.json(
        { error: 'Only admins can manually release funds' },
        { status: 403 }
      );
    }

    // Verify transaction is in correct status (unless force release by admin)
    const validStatuses = ['QUALITY_APPROVED', 'FUNDS_RELEASING'];
    if (!validStatuses.includes(transaction.status) && !forceRelease) {
      return NextResponse.json(
        { error: `Cannot release funds for transaction in ${transaction.status} status` },
        { status: 400 }
      );
    }

    const oldStatus = transaction.status;
    const amount = Number(transaction.amount);
    const platformFee = amount * PLATFORM_FEE_RATE;
    const payoutAmount = amount - platformFee;

    // In production, this would be a Stripe transfer
    const releaseTransactionId = `payout_${transactionId}_${Date.now()}`;

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FUNDS_RELEASED',
        fundsReleasedAt: new Date(),
        fundsReleasedById: isAutoRelease ? null : session.user.id,
        releaseReason: reason || (isAdmin ? 'Admin manual release' : 'Quality approved - auto release'),
        platformFee: platformFee,
        payoutAmount: payoutAmount,
        releaseTransactionId,
        supplierBankAccount: '****' + (transaction.supplier.phone?.slice(-4) || '0000'),
      },
      include: {
        supplier: true,
        buyer: true,
        requirement: true,
        quotation: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // Create status history record
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId,
        oldStatus: oldStatus as any,
        newStatus: 'FUNDS_RELEASED',
        changedById: isAutoRelease ? null : session.user.id,
        reason: reason || 'Funds released to supplier',
        metadata: {
          amount,
          platformFee,
          payoutAmount,
          releaseTransactionId,
        },
      },
    });

    // Update escrow
    await prisma.escrowTransaction.updateMany({
      where: { transactionId },
      data: {
        status: 'RELEASED',
        releaseDate: new Date(),
      },
    });

    // Create transaction milestone
    await prisma.transactionMilestone.create({
      data: {
        transactionId,
        status: 'FUNDS_RELEASED',
        description: `Funds released: $${payoutAmount.toFixed(2)} (after ${(PLATFORM_FEE_RATE * 100).toFixed(0)}% platform fee)`,
        actor: isAutoRelease ? 'system' : session.user.id,
      },
    });

    // Create notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: transaction.supplierId,
          type: 'ESCROW_RELEASED',
          title: 'Payment Released',
          message: `$${payoutAmount.toFixed(2)} has been released to your account.`,
          resourceType: 'transaction',
          resourceId: transactionId,
        },
        {
          userId: transaction.buyerId,
          type: 'TRANSACTION_COMPLETED',
          title: 'Funds Released to Supplier',
          message: `Payment of $${payoutAmount.toFixed(2)} has been released to the supplier.`,
          resourceType: 'transaction',
          resourceId: transactionId,
        },
      ],
    });

    // Emit Socket.io events
    try {
      emitToUser(transaction.supplierId, 'fundsReleased', {
        transactionId,
        transaction: updatedTransaction,
        amount: payoutAmount,
        platformFee,
        timestamp: new Date(),
      });

      emitToUser(transaction.buyerId, 'fundsReleased', {
        transactionId,
        transaction: updatedTransaction,
        amount: payoutAmount,
        timestamp: new Date(),
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    // TODO: Send email notifications
    // await sendPaymentReleasedEmail(transactionId);

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      payout: {
        amount,
        platformFee,
        payoutAmount,
        releaseTransactionId,
        releasedAt: new Date(),
      },
      message: `Funds released successfully. $${payoutAmount.toFixed(2)} will be deposited within 24-48 hours.`,
    });
  } catch (error) {
    console.error('Fund release error:', error);
    return NextResponse.json(
      { error: 'Failed to release funds' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: {
        fundsReleasedAt: true,
        fundsReleasedById: true,
        releaseReason: true,
        supplierBankAccount: true,
        releaseTransactionId: true,
        platformFee: true,
        payoutAmount: true,
        amount: true,
        status: true,
        fundsReleasedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      fundRelease: {
        releasedAt: transaction.fundsReleasedAt,
        releasedBy: transaction.fundsReleasedBy,
        reason: transaction.releaseReason,
        bankAccount: transaction.supplierBankAccount,
        transactionId: transaction.releaseTransactionId,
        amount: transaction.amount,
        platformFee: transaction.platformFee,
        payoutAmount: transaction.payoutAmount,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Get fund release error:', error);
    return NextResponse.json(
      { error: 'Failed to get fund release details' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/db';
import { getEscrowService } from '@/lib/blockchain/escrow';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only buyers can confirm delivery
    if (session.user.role !== 'BUYER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only buyers can confirm delivery' }, { status: 403 });
    }

    const transactionId = params.id;
    const body = await request.json();

    const {
      receivedInGoodCondition,
      quantityMatches,
      qualityAcceptable,
      notes,
      photoUrls,
      signature,
      confirmedAt,
    } = body;

    // Validate confirmation data
    if (!receivedInGoodCondition || !quantityMatches || !qualityAcceptable) {
      return NextResponse.json(
        { error: 'All confirmation checkboxes must be checked' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        escrow: true,
        supplier: true,
        buyer: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify buyer owns this transaction
    if (transaction.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update transaction with delivery confirmation
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'DELIVERY_CONFIRMED',
        deliveryConfirmedAt: new Date(confirmedAt || Date.now()),
        deliveryConfirmedById: session.user.id,
        deliveryNotes: notes,
        deliveryPhotos: photoUrls || [],
      },
    });

    // Create delivery confirmation record
    await prisma.deliveryConfirmation.create({
      data: {
        transactionId,
        receivedInGoodCondition,
        quantityMatches,
        qualityAcceptable,
        notes,
        photoUrls: photoUrls || [],
        signature,
        confirmedAt: new Date(confirmedAt || Date.now()),
      },
    });

    // Create status history
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId,
        oldStatus: transaction.status,
        newStatus: 'DELIVERY_CONFIRMED',
        changedById: session.user.id,
        reason: 'Buyer confirmed delivery receipt',
      },
    });

    // Release payment from escrow if escrow exists
    let releaseResult = null;
    if (transaction.escrow && transaction.escrow.blockchainEscrowId) {
      try {
        const escrowService = getEscrowService();
        const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
        
        if (adminPrivateKey) {
          releaseResult = await escrowService.releasePayment(
            transaction.escrow.blockchainEscrowId,
            adminPrivateKey
          );

          // Update escrow status
          await prisma.escrowTransaction.update({
            where: { id: transaction.escrow.id },
            data: {
              status: 'RELEASED',
              releasedAt: new Date(),
              releaseTxHash: releaseResult.transactionHash,
            },
          });

          // Update transaction with release info
          await prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'FUNDS_RELEASED',
              fundsReleasedAt: new Date(),
              fundsReleasedById: session.user.id,
              releaseTransactionId: releaseResult.transactionHash,
            },
          });
        }
      } catch (escrowError) {
        console.error('Escrow release error:', escrowError);
        // Continue even if escrow release fails - can be retried
      }
    }

    // TODO: Send notification email to supplier
    // await sendPaymentReleasedEmail(transaction.supplier.email, transaction);

    return NextResponse.json({
      success: true,
      message: 'Delivery confirmed and payment release initiated',
      transaction: updatedTransaction,
      releaseTransaction: releaseResult,
    });
  } catch (error) {
    console.error('Delivery confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm delivery' }, { status: 500 });
  }
}

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

    const confirmation = await prisma.deliveryConfirmation.findUnique({
      where: { transactionId },
    });

    if (!confirmation) {
      return NextResponse.json({ error: 'Delivery confirmation not found' }, { status: 404 });
    }

    return NextResponse.json(confirmation);
  } catch (error) {
    console.error('Get delivery confirmation error:', error);
    return NextResponse.json({ error: 'Failed to get delivery confirmation' }, { status: 500 });
  }
}

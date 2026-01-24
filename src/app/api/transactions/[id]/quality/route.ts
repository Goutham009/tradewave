import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

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
    const body = await request.json();
    const {
      rating,
      notes,
      issues,
      approvalStatus,
      photos,
    } = body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!notes || notes.length < 10) {
      return NextResponse.json(
        { error: 'Please provide detailed notes (minimum 10 characters)' },
        { status: 400 }
      );
    }

    if (!approvalStatus || !['APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return NextResponse.json(
        { error: 'Approval status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Validate rating vs approval status
    if (approvalStatus === 'APPROVED' && rating < 3) {
      return NextResponse.json(
        { error: 'Cannot approve with rating less than 3' },
        { status: 400 }
      );
    }

    if (approvalStatus === 'REJECTED' && rating > 2) {
      return NextResponse.json(
        { error: 'Cannot reject with rating greater than 2' },
        { status: 400 }
      );
    }

    // Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        supplier: true,
        buyer: true,
        requirement: true,
        quotation: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user is the buyer
    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the buyer can assess quality' },
        { status: 403 }
      );
    }

    // Verify transaction is in correct status
    const validStatuses = ['QUALITY_PENDING', 'DELIVERY_CONFIRMED', 'QUALITY_CHECK'];
    if (!validStatuses.includes(transaction.status)) {
      return NextResponse.json(
        { error: `Cannot assess quality for transaction in ${transaction.status} status` },
        { status: 400 }
      );
    }

    const oldStatus = transaction.status;
    const newStatus = approvalStatus === 'APPROVED' ? 'QUALITY_APPROVED' : 'QUALITY_REJECTED';

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus as any,
        qualityAssessmentAt: new Date(),
        qualityAssessedById: session.user.id,
        qualityRating: rating,
        qualityNotes: notes,
        qualityIssues: issues || [],
        qualityPhotos: photos || [],
        acceptanceReason: approvalStatus === 'APPROVED' ? notes : null,
        rejectionReason: approvalStatus === 'REJECTED' ? notes : null,
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
        newStatus: newStatus as any,
        changedById: session.user.id,
        reason: approvalStatus === 'APPROVED' 
          ? `Quality approved with rating ${rating}/5` 
          : `Quality rejected: ${notes}`,
        metadata: {
          rating,
          issues,
          approvalStatus,
        },
      },
    });

    // Update escrow
    if (approvalStatus === 'APPROVED') {
      await prisma.escrowTransaction.updateMany({
        where: { transactionId },
        data: {
          qualityApproved: true,
          qualityApprovedAt: new Date(),
        },
      });
    }

    // Create transaction milestone
    await prisma.transactionMilestone.create({
      data: {
        transactionId,
        status: newStatus as any,
        description: approvalStatus === 'APPROVED'
          ? `Quality approved with ${rating}/5 stars`
          : `Quality rejected: ${issues?.join(', ') || 'Issues reported'}`,
        actor: session.user.id,
      },
    });

    let disputeId: string | null = null;
    let fundReleased = false;

    if (approvalStatus === 'APPROVED') {
      // Auto-trigger fund release
      try {
        const releaseResponse = await releaseFunds(transactionId, session.user.id, 'auto-release');
        fundReleased = releaseResponse.success;
      } catch (releaseError) {
        console.error('Auto fund release failed:', releaseError);
      }

      // Emit approval event
      emitToUser(transaction.supplierId, 'qualityApproved', {
        transactionId,
        transaction: updatedTransaction,
        rating,
        timestamp: new Date(),
      });
    } else {
      // Create dispute for rejection
      const dispute = await prisma.notification.create({
        data: {
          userId: transaction.supplierId,
          type: 'DISPUTE_OPENED',
          title: 'Quality Rejected - Dispute Opened',
          message: `Buyer rejected quality for order. Reason: ${notes}`,
          resourceType: 'transaction',
          resourceId: transactionId,
        },
      });

      // Also create buyer notification
      await prisma.notification.create({
        data: {
          userId: transaction.buyerId,
          type: 'DISPUTE_OPENED',
          title: 'Dispute Filed',
          message: `Your quality rejection has initiated a dispute. Our team will review.`,
          resourceType: 'transaction',
          resourceId: transactionId,
        },
      });

      disputeId = dispute.id;

      // Emit rejection event
      emitToUser(transaction.supplierId, 'qualityRejected', {
        transactionId,
        transaction: updatedTransaction,
        rating,
        issues,
        reason: notes,
        timestamp: new Date(),
      });
    }

    // Notify buyer
    emitToUser(transaction.buyerId, approvalStatus === 'APPROVED' ? 'qualityApproved' : 'qualityRejected', {
      transactionId,
      transaction: updatedTransaction,
      rating,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      approvalStatus,
      fundReleased,
      disputeCreated: approvalStatus === 'REJECTED',
      disputeId,
      message: approvalStatus === 'APPROVED'
        ? 'Quality approved. Funds are being released to the supplier.'
        : 'Quality rejected. A dispute has been opened for review.',
    });
  } catch (error) {
    console.error('Quality assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quality assessment' },
      { status: 500 }
    );
  }
}

// Helper function to release funds
async function releaseFunds(transactionId: string, userId: string, reason: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { supplier: true },
  });

  if (!transaction) {
    return { success: false, error: 'Transaction not found' };
  }

  const platformFeeRate = 0.02; // 2% platform fee
  const amount = Number(transaction.amount);
  const platformFee = amount * platformFeeRate;
  const payoutAmount = amount - platformFee;

  // Update transaction
  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'FUNDS_RELEASED',
      fundsReleasedAt: new Date(),
      fundsReleasedById: userId,
      releaseReason: reason,
      platformFee: platformFee,
      payoutAmount: payoutAmount,
      releaseTransactionId: `payout_${Date.now()}`, // Would be actual Stripe transfer ID
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

  // Create status history
  await prisma.transactionStatusHistory.create({
    data: {
      transactionId,
      oldStatus: 'QUALITY_APPROVED',
      newStatus: 'FUNDS_RELEASED',
      changedById: userId,
      reason,
      metadata: { platformFee, payoutAmount },
    },
  });

  // Emit event
  emitToUser(transaction.supplierId, 'fundsReleased', {
    transactionId,
    amount: payoutAmount,
    timestamp: new Date(),
  });

  return { success: true, payoutAmount };
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
        qualityAssessmentAt: true,
        qualityAssessedById: true,
        qualityRating: true,
        qualityNotes: true,
        qualityIssues: true,
        qualityPhotos: true,
        acceptanceReason: true,
        rejectionReason: true,
        status: true,
        qualityAssessedBy: {
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
      quality: {
        assessedAt: transaction.qualityAssessmentAt,
        assessedBy: transaction.qualityAssessedBy,
        rating: transaction.qualityRating,
        notes: transaction.qualityNotes,
        issues: transaction.qualityIssues,
        photos: transaction.qualityPhotos,
        acceptanceReason: transaction.acceptanceReason,
        rejectionReason: transaction.rejectionReason,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Get quality assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to get quality assessment' },
      { status: 500 }
    );
  }
}

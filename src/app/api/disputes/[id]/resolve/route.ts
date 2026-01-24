import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { adminDecision, resolutionAmount, resolutionReason } = await req.json();

    if (!adminDecision) {
      return NextResponse.json({ error: 'Decision is required' }, { status: 400 });
    }

    const validDecisions = ['FULL_REFUND', 'PARTIAL_REFUND', 'FULL_PAYMENT', 'SPLIT_50_50', 'NO_ACTION'];
    if (!validDecisions.includes(adminDecision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    if (adminDecision === 'PARTIAL_REFUND' && !resolutionAmount) {
      return NextResponse.json({ error: 'Resolution amount required for partial refund' }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { 
        transaction: { 
          include: { 
            buyer: true, 
            supplier: true,
            escrow: true,
          } 
        } 
      }
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
      return NextResponse.json({ error: 'Dispute already resolved' }, { status: 400 });
    }

    const transactionAmount = Number(dispute.transaction.amount);

    // Calculate fund distribution
    let buyerAmount = 0;
    let supplierAmount = 0;

    switch (adminDecision) {
      case 'FULL_REFUND':
        buyerAmount = transactionAmount;
        supplierAmount = 0;
        break;
      case 'FULL_PAYMENT':
        buyerAmount = 0;
        supplierAmount = transactionAmount;
        break;
      case 'SPLIT_50_50':
        buyerAmount = transactionAmount / 2;
        supplierAmount = transactionAmount / 2;
        break;
      case 'PARTIAL_REFUND':
        buyerAmount = resolutionAmount || 0;
        supplierAmount = transactionAmount - buyerAmount;
        break;
      case 'NO_ACTION':
        buyerAmount = 0;
        supplierAmount = 0;
        break;
    }

    // Platform fee (2%) from supplier amount
    const platformFee = supplierAmount * 0.02;
    const supplierPayout = supplierAmount - platformFee;

    // Resolve dispute
    const resolvedDispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        adminDecision,
        resolutionAmount: resolutionAmount || null,
        resolutionReason: resolutionReason || null,
        reviewedByAdminId: session.user.id,
        resolvedAt: new Date(),
        buyerAmount,
        supplierAmount: supplierPayout,
      },
      include: {
        transaction: { include: { buyer: true, supplier: true } },
        filedByUser: { select: { id: true, email: true, name: true } },
      }
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: dispute.transactionId },
      data: {
        status: 'DISPUTE_RESOLVED',
        fundsReleasedAt: new Date(),
        fundsReleasedById: session.user.id,
        releaseReason: `Dispute resolved: ${adminDecision}`,
        platformFee,
        payoutAmount: supplierPayout,
      }
    });

    // Update escrow status
    if (dispute.transaction.escrow) {
      await prisma.escrowTransaction.update({
        where: { id: dispute.transaction.escrow.id },
        data: { 
          status: adminDecision === 'FULL_REFUND' ? 'REFUNDED' : 'RELEASED',
          releaseDate: new Date(),
        }
      });
    }

    // Create status history
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId: dispute.transactionId,
        oldStatus: dispute.transaction.status,
        newStatus: 'DISPUTE_RESOLVED',
        changedById: session.user.id,
        reason: `Dispute resolved with decision: ${adminDecision}`,
        metadata: {
          buyerAmount,
          supplierAmount: supplierPayout,
          platformFee,
          decision: adminDecision,
        }
      }
    });

    // Create milestone
    await prisma.transactionMilestone.create({
      data: {
        transactionId: dispute.transactionId,
        status: 'DISPUTE_RESOLVED',
        description: `Dispute resolved: ${adminDecision}. Buyer: $${buyerAmount.toFixed(2)}, Supplier: $${supplierPayout.toFixed(2)}`,
        actor: session.user.email || 'admin',
      }
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: dispute.transaction.buyerId,
        type: 'DISPUTE_OPENED',
        title: 'Dispute Resolved',
        message: buyerAmount > 0 
          ? `Your dispute has been resolved. You will receive $${buyerAmount.toFixed(2)}.`
          : `Your dispute has been resolved. Decision: ${adminDecision}`,
        resourceType: 'dispute',
        resourceId: id,
      }
    });

    emitToUser(dispute.transaction.buyerId, 'disputeResolved', {
      disputeId: id,
      transactionId: dispute.transactionId,
      decision: adminDecision,
      buyerAmount,
      supplierAmount: supplierPayout,
    });

    // Add dispute message for resolution
    await prisma.disputeMessage.create({
      data: {
        disputeId: id,
        userId: session.user.id,
        message: `**Dispute Resolved**\n\nDecision: ${adminDecision}\n${resolutionReason ? `Reason: ${resolutionReason}\n` : ''}${buyerAmount > 0 ? `Buyer receives: $${buyerAmount.toFixed(2)}\n` : ''}${supplierPayout > 0 ? `Supplier receives: $${supplierPayout.toFixed(2)}` : ''}`,
        isAdmin: true,
      }
    });

    return NextResponse.json({
      success: true,
      dispute: resolvedDispute,
      distribution: {
        buyerAmount,
        supplierAmount: supplierPayout,
        platformFee,
        total: transactionAmount,
      }
    });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        adminDecision: true,
        resolutionAmount: true,
        resolutionReason: true,
        buyerAmount: true,
        supplierAmount: true,
        resolvedAt: true,
        reviewedByAdmin: { select: { id: true, name: true, email: true } },
      }
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      resolution: dispute
    });
  } catch (error) {
    console.error('Error fetching resolution:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/transactions/[id]/review - Admin reviews transaction and sets up escrow
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      action, // 'approve', 'reject'
      adminReviewedBy,
      adminNotes,
      // Escrow setup
      advancePercentage, // e.g., 30
      paymentTerms,
      releaseConditions, // text describing conditions
    } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        quotation: { select: { total: true, currency: true, supplierTotalAmount: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const totalAmount = Number(transaction.amount);
      const advancePct = advancePercentage || 30;
      const advanceAmount = Math.round(totalAmount * (advancePct / 100) * 100) / 100;
      const balanceAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;

      // Update transaction
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: 'ESCROW_CREATED',
          adminReviewed: true,
          adminReviewedBy: adminReviewedBy || null,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
          advanceAmount: advanceAmount,
          balanceAmount: balanceAmount,
          paymentTerms: paymentTerms || `${advancePct}% advance, ${100 - advancePct}% on delivery confirmation`,
        },
      });

      // Create escrow account
      const escrow = await prisma.escrowTransaction.create({
        data: {
          transactionId: params.id,
          buyerId: transaction.buyerId,
          supplierId: transaction.supplierId,
          totalAmount: totalAmount,
          amount: totalAmount,
          advanceAmount: advanceAmount,
          balanceAmount: balanceAmount,
          currency: transaction.currency,
          status: 'PENDING_PAYMENT',
          releaseConditionsText: releaseConditions || 'Funds released after delivery confirmation and quality approval.',
          createdBy: adminReviewedBy || null,
        },
      });

      // Create release conditions
      await prisma.releaseCondition.createMany({
        data: [
          { escrowId: escrow.id, type: 'DELIVERY_CONFIRMED', description: 'Buyer confirms receipt of goods' },
          { escrowId: escrow.id, type: 'QUALITY_APPROVED', description: 'Quality inspection passed' },
          { escrowId: escrow.id, type: 'DOCUMENTS_VERIFIED', description: 'All shipping documents verified' },
        ],
      });

      // TODO: Notify buyer to make advance payment
      // TODO: Notify AM about escrow setup

      return NextResponse.json({
        status: 'success',
        transaction: {
          id: params.id,
          status: 'ESCROW_CREATED',
          totalAmount,
          advanceAmount,
          balanceAmount,
          paymentTerms: `${advancePct}% advance, ${100 - advancePct}% on delivery`,
        },
        escrow: {
          id: escrow.id,
          status: escrow.status,
        },
      });
    } else if (action === 'reject') {
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          adminReviewed: true,
          adminReviewedBy: adminReviewedBy || null,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      return NextResponse.json({ status: 'success', message: 'Transaction rejected' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error reviewing transaction:', error);
    return NextResponse.json({ error: 'Failed to review transaction' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkBuyerGoodStanding } from '@/lib/services/goodStandingService';

// POST /api/admin/transactions/create - Admin creates transaction after quote acceptance
// Process flow: Accept Quote → KYB/Good Standing Check → Admin Creates Transaction
// First-time buyer: KYB completed check
// Existing buyer: Good standing check
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      quotationId,
      adminCreatedBy,
      adminNotes,
      // Escrow setup (optional, can be done in separate review step)
      advancePercentage,
      paymentTerms,
    } = body;

    if (!quotationId) {
      return NextResponse.json({ error: 'quotationId is required' }, { status: 400 });
    }

    // Fetch accepted quotation with full details
    const quotation: any = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        requirement: true,
        supplier: { select: { id: true, name: true, companyName: true } },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    if (quotation.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: `Cannot create transaction for quotation in ${quotation.status} status. Must be ACCEPTED.` },
        { status: 400 }
      );
    }

    // Check if transaction already exists for this quotation
    const existingTxn = await prisma.transaction.findFirst({
      where: { quotationId: quotationId as string, status: { not: 'CANCELLED' as any } },
    });
    if (existingTxn) {
      return NextResponse.json(
        { error: 'Transaction already exists for this quotation', transactionId: existingTxn.id },
        { status: 409 }
      );
    }

    const buyerId: string = quotation.requirement.buyerId;
    const requirement = quotation.requirement;

    // --- VERIFICATION CHECKS ---

    // Count buyer's previous orders to determine first-time vs existing
    const buyerOrderCount = await prisma.transaction.count({
      where: { buyerId, status: { not: 'CANCELLED' as any } },
    });
    const isFirstTimeBuyer = buyerOrderCount === 0;

    // CHECK 1: KYB completed check (first-time buyers)
    if (isFirstTimeBuyer) {
      const buyer: any = await prisma.user.findUnique({
        where: { id: buyerId },
      });

      const kybStatus = buyer?.kybStatus;
      if (kybStatus !== 'COMPLETED') {
        return NextResponse.json({
          status: 'kyb_required',
          message: 'KYB verification must be completed before creating a transaction for a first-time buyer.',
          buyerId,
          buyerName: buyer?.name,
          companyName: buyer?.companyName,
          currentKybStatus: kybStatus || 'PENDING',
          action: 'Complete KYB verification first, then retry transaction creation.',
        }, { status: 422 });
      }
    }

    // CHECK 2: Good standing check (existing buyers)
    if (!isFirstTimeBuyer) {
      const standingCheck = await checkBuyerGoodStanding(buyerId);
      if (!standingCheck.goodStanding) {
        return NextResponse.json({
          status: 'manual_review_required',
          message: 'Buyer is not in good standing. Transaction requires manual override.',
          buyerId,
          goodStanding: false,
          checks: standingCheck.checks,
          reasons: standingCheck.reasons,
          metrics: standingCheck.metrics,
          recommendedAction: standingCheck.recommendedAction,
          action: 'Resolve standing issues or provide admin override to proceed.',
        }, { status: 422 });
      }
    }

    // --- ALL CHECKS PASSED — CREATE TRANSACTION ---

    const transaction = await prisma.transaction.create({
      data: {
        requirementId: requirement.id,
        quotationId,
        buyerId,
        supplierId: quotation.supplierId,
        status: 'PENDING_ADMIN_REVIEW',
        amount: quotation.total,
        currency: quotation.currency,
        productName: requirement.title,
        productQuantity: quotation.quantity,
        productUnit: requirement.unit,
        pricePerUnit: quotation.unitPrice,
        paymentTerms: quotation.paymentTerms || paymentTerms || null,
        adminReviewed: true,
        adminReviewedBy: adminCreatedBy || null,
        adminReviewedAt: new Date(),
        adminNotes: adminNotes || null,
      } as any,
    });

    // If escrow parameters provided, set up escrow immediately
    let escrow = null;
    if (advancePercentage) {
      const totalAmount = Number(quotation.total);
      const advancePct = advancePercentage || 30;
      const advanceAmount = Math.round(totalAmount * (advancePct / 100) * 100) / 100;
      const balanceAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;

      // Update transaction with payment breakdown
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'ESCROW_CREATED',
          advanceAmount,
          balanceAmount,
          paymentTerms: paymentTerms || `${advancePct}% advance, ${100 - advancePct}% on delivery confirmation`,
        } as any,
      });

      // Create escrow
      escrow = await prisma.escrowTransaction.create({
        data: {
          transactionId: transaction.id,
          buyerId,
          supplierId: quotation.supplierId,
          totalAmount,
          amount: totalAmount,
          advanceAmount,
          balanceAmount,
          currency: quotation.currency,
          status: 'PENDING_PAYMENT',
          releaseConditionsText: 'Funds released after delivery confirmation and quality approval.',
          createdBy: adminCreatedBy || null,
        } as any,
      });

      // Create release conditions
      await prisma.releaseCondition.createMany({
        data: [
          { escrowId: escrow.id, type: 'DELIVERY_CONFIRMED', description: 'Buyer confirms receipt of goods' },
          { escrowId: escrow.id, type: 'QUALITY_APPROVED', description: 'Quality inspection passed' },
          { escrowId: escrow.id, type: 'DOCUMENTS_VERIFIED', description: 'All shipping documents verified' },
        ],
      });
    }

    // Update buyer order count
    await prisma.user.update({
      where: { id: buyerId },
      data: { totalOrderCount: buyerOrderCount + 1 } as any,
    });

    // TODO: Notify buyer about transaction creation + payment instructions
    // TODO: Notify supplier about confirmed order
    // TODO: Notify AM

    return NextResponse.json({
      status: 'success',
      transaction: {
        id: transaction.id,
        status: escrow ? 'ESCROW_CREATED' : 'PENDING_ADMIN_REVIEW',
        amount: Number(transaction.amount),
        currency: transaction.currency,
        buyerId,
        supplierId: quotation.supplierId,
        supplier: quotation.supplier.companyName,
        requirementId: requirement.id,
        isFirstTimeBuyer,
      },
      escrow: escrow ? {
        id: (escrow as any).id,
        status: (escrow as any).status,
        totalAmount: Number((escrow as any).totalAmount),
        advanceAmount: Number((escrow as any).advanceAmount),
        balanceAmount: Number((escrow as any).balanceAmount),
      } : null,
      checksPerformed: {
        kybCheck: isFirstTimeBuyer ? 'PASSED' : 'NOT_REQUIRED',
        goodStandingCheck: !isFirstTimeBuyer ? 'PASSED' : 'NOT_REQUIRED',
      },
      message: escrow
        ? 'Transaction created with escrow. Buyer can now make advance payment.'
        : 'Transaction created. Proceed to set up escrow via transaction review.',
    });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { checkBuyerGoodStanding } from '@/lib/services/goodStandingService';
import {
  buildOrderReferences,
  formatQuotationReference,
  formatRequirementReference,
  formatTransactionReference,
} from '@/lib/flow-references';

// POST /api/admin/transactions/create - Admin creates transaction after quote acceptance
// Process flow: Accept Quote → KYB/Good Standing Check → Admin Creates Transaction
// First-time buyer: KYB completed check
// Existing buyer: Good standing check
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      quotationId,
      adminNotes,
      // Escrow setup (optional, can be done in separate review step)
      advancePercentage,
      paymentTerms,
    } = body;

    const adminCreatedBy = session.user.id;

    if (!quotationId) {
      return NextResponse.json({ error: 'quotationId is required' }, { status: 400 });
    }

    // Fetch accepted quotation with full details
    const quotation: any = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        requirement: true,
        supplier: { select: { id: true, name: true, companyName: true, email: true } },
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
        adminReviewedBy: adminCreatedBy,
        adminReviewedAt: new Date(),
        adminNotes: adminNotes || null,
      } as any,
    });

    const references = {
      requirementReference: formatRequirementReference(requirement.id),
      quotationReference: formatQuotationReference(quotation.id),
      transactionReference: formatTransactionReference(transaction.id),
      ...buildOrderReferences(transaction.id),
    };

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
          createdBy: adminCreatedBy,
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

    // Generate invoice record once transaction structure is approved by admin
    const existingInvoice = await prisma.transactionDocument.findFirst({
      where: {
        transactionId: transaction.id,
        type: 'INVOICE',
      },
      select: { id: true },
    });

    if (!existingInvoice) {
      await prisma.transactionDocument.create({
        data: {
          transactionId: transaction.id,
          type: 'INVOICE',
          name: `Invoice-${references.buyerOrderId}.pdf`,
          url: `/api/transactions/${transaction.id}/documents/invoice`,
          verified: false,
        },
      });
    }

    let supplierUserId: string | null = null;
    if (quotation.supplier.email) {
      const supplierUser = await prisma.user.findFirst({
        where: {
          role: 'SUPPLIER',
          email: quotation.supplier.email,
        },
        select: { id: true },
      });
      supplierUserId = supplierUser?.id || null;
    }

    const notifications = [
      {
        userId: buyerId,
        type: 'SYSTEM' as const,
        title: 'Transaction Created - Payment Action Required',
        message: `${references.transactionReference} (${references.buyerOrderId}) was created for ${references.requirementReference}. Complete advance payment to proceed.`,
        resourceType: 'transaction',
        resourceId: transaction.id,
      },
      {
        userId: supplierUserId || '',
        type: 'SYSTEM' as const,
        title: 'Transaction Created for Accepted Quotation',
        message: `${references.transactionReference} (${references.supplierOrderId}) was generated after buyer acceptance of ${references.quotationReference}.`,
        resourceType: 'transaction',
        resourceId: transaction.id,
      },
      ...(requirement.assignedAccountManagerId
        ? [
            {
              userId: requirement.assignedAccountManagerId,
              type: 'SYSTEM' as const,
              title: 'Client Transaction Created',
              message: `Transaction ${references.transactionReference} is created for ${references.requirementReference}. Internal order ${references.internalOrderId}.`,
              resourceType: 'transaction',
              resourceId: transaction.id,
            },
          ]
        : []),
    ].filter((item) => item.userId);

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      status: 'success',
      transaction: {
        id: transaction.id,
        reference: references.transactionReference,
        status: escrow ? 'ESCROW_CREATED' : 'PENDING_ADMIN_REVIEW',
        amount: Number(transaction.amount),
        currency: transaction.currency,
        buyerId,
        supplierId: quotation.supplierId,
        supplier: quotation.supplier.companyName,
        requirementId: requirement.id,
        isFirstTimeBuyer,
      },
      references,
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

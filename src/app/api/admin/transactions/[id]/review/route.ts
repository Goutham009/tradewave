import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  buildOrderReferences,
  formatQuotationReference,
  formatRequirementReference,
  formatTransactionReference,
} from '@/lib/flow-references';

// POST /api/admin/transactions/[id]/review - Admin reviews transaction and sets up escrow
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      action, // 'approve', 'reject'
      adminNotes,
      // Escrow setup
      advancePercentage, // e.g., 30
      paymentTerms,
      releaseConditions, // text describing conditions
    } = body;
    const adminReviewedBy = session.user.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        quotation: { select: { total: true, currency: true, supplierTotalAmount: true } },
        supplier: { select: { email: true } },
        requirement: { select: { id: true, assignedAccountManagerId: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const references = {
      requirementReference: formatRequirementReference(transaction.requirementId),
      quotationReference: formatQuotationReference(transaction.quotationId),
      transactionReference: formatTransactionReference(transaction.id),
      ...buildOrderReferences(transaction.id),
    };

    let supplierUserId: string | null = null;
    if (transaction.supplier?.email) {
      const supplierUser = await prisma.user.findFirst({
        where: {
          role: 'SUPPLIER',
          email: transaction.supplier.email,
        },
        select: { id: true },
      });
      supplierUserId = supplierUser?.id || null;
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
          adminReviewedBy,
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
          createdBy: adminReviewedBy,
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

      // Ensure invoice record exists for downstream order docs
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

      const notifications: any[] = [
        {
          userId: transaction.buyerId,
          type: 'SYSTEM',
          title: 'Transaction Approved - Complete Payment',
          message: `${references.transactionReference} (${references.buyerOrderId}) is approved. Please complete advance payment to move the order forward.`,
          resourceType: 'transaction',
          resourceId: transaction.id,
        },
        ...(supplierUserId
          ? [
              {
                userId: supplierUserId,
                type: 'SYSTEM',
                title: 'Transaction Approved by Admin',
                message: `${references.transactionReference} (${references.supplierOrderId}) is approved. Buyer payment is pending before production start.`,
                resourceType: 'transaction',
                resourceId: transaction.id,
              },
            ]
          : []),
        ...(transaction.requirement.assignedAccountManagerId
          ? [
              {
                userId: transaction.requirement.assignedAccountManagerId,
                type: 'SYSTEM',
                title: 'Client Transaction Approved',
                message: `${references.transactionReference} approved with internal order ${references.internalOrderId}. Buyer payment is now pending.`,
                resourceType: 'transaction',
                resourceId: transaction.id,
              },
            ]
          : []),
      ];

      await prisma.notification.createMany({
        data: notifications,
      });

      return NextResponse.json({
        status: 'success',
        transaction: {
          id: params.id,
          reference: references.transactionReference,
          status: 'ESCROW_CREATED',
          totalAmount,
          advanceAmount,
          balanceAmount,
          paymentTerms: `${advancePct}% advance, ${100 - advancePct}% on delivery`,
        },
        references,
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
          adminReviewedBy,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      const rejectNotifications: any[] = [
        {
          userId: transaction.buyerId,
          type: 'SYSTEM',
          title: 'Transaction Rejected by Admin',
          message: `${references.transactionReference} was rejected by admin.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
          resourceType: 'transaction',
          resourceId: transaction.id,
        },
        ...(supplierUserId
          ? [
              {
                userId: supplierUserId,
                type: 'SYSTEM',
                title: 'Transaction Rejected',
                message: `${references.transactionReference} was rejected by admin.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
                resourceType: 'transaction',
                resourceId: transaction.id,
              },
            ]
          : []),
        ...(transaction.requirement.assignedAccountManagerId
          ? [
              {
                userId: transaction.requirement.assignedAccountManagerId,
                type: 'SYSTEM',
                title: 'Client Transaction Rejected',
                message: `${references.transactionReference} was rejected by admin.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
                resourceType: 'transaction',
                resourceId: transaction.id,
              },
            ]
          : []),
      ];

      await prisma.notification.createMany({
        data: rejectNotifications,
      });

      return NextResponse.json({ status: 'success', message: 'Transaction rejected', references });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error reviewing transaction:', error);
    return NextResponse.json({ error: 'Failed to review transaction' }, { status: 500 });
  }
}

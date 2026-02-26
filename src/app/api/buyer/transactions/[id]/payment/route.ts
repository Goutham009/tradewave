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

// POST /api/buyer/transactions/[id]/payment - Process buyer payment (advance or balance)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      paymentType, // 'advance' or 'balance'
      amount,
      paymentMethod, // 'STRIPE', 'BANK_TRANSFER', 'WIRE'
    } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        escrow: true,
        supplier: {
          select: {
            email: true,
          },
        },
        requirement: {
          select: {
            id: true,
            assignedAccountManagerId: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!transaction.escrow) {
      return NextResponse.json({ error: 'Escrow not set up for this transaction' }, { status: 400 });
    }

    const references = {
      requirementReference: formatRequirementReference(transaction.requirementId),
      quotationReference: formatQuotationReference(transaction.quotationId),
      transactionReference: formatTransactionReference(transaction.id),
      ...buildOrderReferences(transaction.id),
    };

    const buyerVisibleReferences = {
      requirementReference: references.requirementReference,
      quotationReference: references.quotationReference,
      transactionReference: references.transactionReference,
      buyerOrderId: references.buyerOrderId,
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

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId: params.id,
        amount: parseFloat(amount),
        currency: transaction.currency,
        method: paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'STRIPE',
        status: 'PROCESSING',
        metadata: {
          paymentType,
          buyerId: session.user.id,
          escrowId: transaction.escrow.id,
        },
      },
    });

    if (paymentType === 'advance') {
      // Update escrow with advance payment
      await prisma.escrowTransaction.update({
        where: { id: transaction.escrow.id },
        data: {
          advancePaid: true,
          advancePaidAt: new Date(),
          advancePaidAmount: parseFloat(amount),
          status: 'FUNDS_HELD',
        },
      });

      // Update transaction status
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: 'PAYMENT_RECEIVED',
          paymentMethod: paymentMethod || 'ESCROW',
          paymentStatus: 'SUCCEEDED',
          paymentConfirmedAt: new Date(),
        },
      });

      // Update payment to succeeded
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' },
      });

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const notifications = [
        {
          userId: session.user.id,
          type: 'PAYMENT_RECEIVED' as const,
          title: 'Advance Payment Submitted',
          message: `Advance payment for ${references.transactionReference} (${references.buyerOrderId}) was submitted successfully.`,
          resourceType: 'transaction',
          resourceId: transaction.id,
        },
        ...admins.map((admin) => ({
          userId: admin.id,
          type: 'PAYMENT_RECEIVED' as const,
          title: 'Buyer Payment Submitted',
          message: `Buyer submitted advance payment for ${references.transactionReference}. Please verify and confirm transaction progression.`,
          resourceType: 'transaction',
          resourceId: transaction.id,
        })),
        ...(supplierUserId
          ? [
              {
                userId: supplierUserId,
                type: 'PAYMENT_RECEIVED' as const,
                title: 'Buyer Payment Received',
                message: `Advance payment was recorded for ${references.supplierOrderId}. Prepare production kickoff.`,
                resourceType: 'transaction',
                resourceId: transaction.id,
              },
            ]
          : []),
        ...(transaction.requirement.assignedAccountManagerId
          ? [
              {
                userId: transaction.requirement.assignedAccountManagerId,
                type: 'PAYMENT_RECEIVED' as const,
                title: 'Client Payment Completed',
                message: `Your client paid advance for ${references.transactionReference}. Monitor next production milestones.`,
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
        payment: {
          id: payment.id,
          type: 'advance',
          amount: parseFloat(amount),
          status: 'SUCCEEDED',
        },
        transaction: {
          id: params.id,
          status: 'PAYMENT_RECEIVED',
          nextStep: 'Supplier will begin production',
        },
        references: buyerVisibleReferences,
      });
    } else if (paymentType === 'balance') {
      // Update escrow with balance payment
      await prisma.escrowTransaction.update({
        where: { id: transaction.escrow.id },
        data: {
          balancePaid: true,
          balancePaidAt: new Date(),
          balanceReleasedAmount: parseFloat(amount),
        },
      });

      // Update payment to succeeded
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' },
      });

      return NextResponse.json({
        status: 'success',
        payment: {
          id: payment.id,
          type: 'balance',
          amount: parseFloat(amount),
          status: 'SUCCEEDED',
        },
        references: buyerVisibleReferences,
      });
    } else {
      return NextResponse.json({ error: 'Invalid payment type. Use: advance or balance' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}

// GET /api/buyer/transactions/[id]/payment - Get payment status and details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        escrow: {
          include: { releaseConditions: true },
        },
        payments: { orderBy: { createdAt: 'desc' } },
        quotation: {
          select: {
            unitPrice: true,
            quantity: true,
            total: true,
            currency: true,
            leadTime: true,
          },
        },
        supplier: { select: { companyName: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: Number(transaction.amount),
        advanceAmount: transaction.advanceAmount ? Number(transaction.advanceAmount) : null,
        balanceAmount: transaction.balanceAmount ? Number(transaction.balanceAmount) : null,
        currency: transaction.currency,
        paymentTerms: transaction.paymentTerms,
        productName: transaction.productName,
        supplier: transaction.supplier?.companyName,
      },
      escrow: transaction.escrow ? {
        id: transaction.escrow.id,
        status: transaction.escrow.status,
        totalAmount: Number(transaction.escrow.totalAmount),
        advancePaid: transaction.escrow.advancePaid,
        advancePaidAmount: transaction.escrow.advancePaidAmount ? Number(transaction.escrow.advancePaidAmount) : null,
        balancePaid: transaction.escrow.balancePaid,
        releaseConditions: transaction.escrow.releaseConditions,
      } : null,
      payments: transaction.payments.map(p => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 500 });
  }
}

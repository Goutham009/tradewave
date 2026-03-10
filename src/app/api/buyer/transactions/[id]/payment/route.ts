import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { createPaymentIntent } from '@/lib/services/paymentService';
import { sendPaymentConfirmedEmail } from '@/lib/email/triggers';
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

    if (!paymentType || !['advance', 'balance'].includes(paymentType)) {
      return NextResponse.json({ error: 'Invalid payment type. Use: advance or balance' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    const isStripe = paymentMethod !== 'BANK_TRANSFER' && paymentMethod !== 'WIRE';

    // --- Stripe integration: create a PaymentIntent instead of marking SUCCEEDED immediately ---
    let stripePaymentIntentId: string | null = null;
    let stripeClientSecret: string | null = null;

    if (isStripe) {
      const stripeResult = await createPaymentIntent({
        amount: parsedAmount,
        currency: transaction.currency || 'USD',
        transactionId: params.id,
        buyerId: session.user.id,
        metadata: {
          paymentType,
          escrowId: transaction.escrow.id,
        },
      });

      if (!stripeResult.success || !stripeResult.clientSecret) {
        return NextResponse.json(
          { error: stripeResult.error || 'Failed to create Stripe payment intent' },
          { status: 502 }
        );
      }

      stripePaymentIntentId = stripeResult.paymentIntentId || null;
      stripeClientSecret = stripeResult.clientSecret;
    }

    // Create payment record — stays PROCESSING until webhook (Stripe) or manual verification (bank)
    const payment = await prisma.payment.create({
      data: {
        transactionId: params.id,
        amount: parsedAmount,
        currency: transaction.currency,
        method: isStripe ? 'STRIPE' : 'BANK_TRANSFER',
        status: 'PROCESSING',
        providerPaymentId: stripePaymentIntentId,
        clientSecret: stripeClientSecret,
        metadata: {
          paymentType,
          buyerId: session.user.id,
          escrowId: transaction.escrow.id,
        },
      },
    });

    // Update transaction to reflect payment is in-progress
    await prisma.transaction.update({
      where: { id: params.id },
      data: {
        paymentMethod: isStripe ? 'ESCROW' : (paymentMethod || 'BANK_TRANSFER'),
        paymentStatus: 'PROCESSING',
      },
    });

    // --- For non-Stripe methods, mark as SUCCEEDED immediately (bank transfer confirmed externally) ---
    if (!isStripe) {
      await finalizePayment({
        paymentId: payment.id,
        transactionId: params.id,
        escrowId: transaction.escrow.id,
        paymentType,
        amount: parsedAmount,
        buyerId: session.user.id,
        supplierUserId,
        amId: transaction.requirement.assignedAccountManagerId,
        references,
      });

      // Send payment confirmed email
      sendPaymentConfirmedEmail(params.id).catch(console.error);

      return NextResponse.json({
        status: 'success',
        payment: {
          id: payment.id,
          type: paymentType,
          amount: parsedAmount,
          status: 'SUCCEEDED',
          method: 'BANK_TRANSFER',
        },
        transaction: {
          id: params.id,
          status: paymentType === 'advance' ? 'PAYMENT_RECEIVED' : transaction.status,
          nextStep: paymentType === 'advance' ? 'Supplier will begin production' : 'Balance payment recorded',
        },
        references: buyerVisibleReferences,
      });
    }

    // --- For Stripe, return clientSecret so frontend can confirm on client side ---
    // Payment stays PROCESSING until Stripe webhook confirms it
    return NextResponse.json({
      status: 'pending_confirmation',
      payment: {
        id: payment.id,
        type: paymentType,
        amount: parsedAmount,
        status: 'PROCESSING',
        method: 'STRIPE',
      },
      stripe: {
        clientSecret: stripeClientSecret,
        paymentIntentId: stripePaymentIntentId,
      },
      transaction: {
        id: params.id,
        status: transaction.status,
        nextStep: 'Complete payment via Stripe checkout',
      },
      references: buyerVisibleReferences,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}

// Helper: finalize a payment (mark SUCCEEDED, update escrow, create notifications)
// Used by both the bank-transfer immediate path and the Stripe webhook
interface FinalizePaymentParams {
  paymentId: string;
  transactionId: string;
  escrowId: string;
  paymentType: string;
  amount: number;
  buyerId: string;
  supplierUserId: string | null;
  amId: string | null;
  references: Record<string, string>;
}

export async function finalizePayment(params: FinalizePaymentParams) {
  const { paymentId, transactionId, escrowId, paymentType, amount, buyerId, supplierUserId, amId, references } = params;

  // Mark payment SUCCEEDED
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'SUCCEEDED',
      paidAt: new Date(),
      failedAt: null,
    },
  });

  if (paymentType === 'advance') {
    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        advancePaid: true,
        advancePaidAt: new Date(),
        advancePaidAmount: amount,
        status: 'FUNDS_HELD',
      },
    });

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'PAYMENT_RECEIVED',
        paymentStatus: 'SUCCEEDED',
        paymentConfirmedAt: new Date(),
      },
    });
  } else {
    // balance
    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        balancePaid: true,
        balancePaidAt: new Date(),
        balanceReleasedAmount: amount,
      },
    });

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { paymentStatus: 'SUCCEEDED' },
    });
  }

  // Create notifications for all stakeholders
  const txRef = references.transactionReference || transactionId;
  const notifications: Array<{
    userId: string;
    type: 'PAYMENT_RECEIVED';
    title: string;
    message: string;
    resourceType: string;
    resourceId: string;
  }> = [];

  // Buyer
  notifications.push({
    userId: buyerId,
    type: 'PAYMENT_RECEIVED',
    title: paymentType === 'advance' ? 'Advance Payment Confirmed' : 'Balance Payment Confirmed',
    message: `Your ${paymentType} payment for ${txRef} has been confirmed.`,
    resourceType: 'transaction',
    resourceId: transactionId,
  });

  // Supplier
  if (supplierUserId) {
    notifications.push({
      userId: supplierUserId,
      type: 'PAYMENT_RECEIVED',
      title: 'Buyer Payment Received',
      message: `${paymentType === 'advance' ? 'Advance' : 'Balance'} payment received for ${txRef}. ${paymentType === 'advance' ? 'Prepare production kickoff.' : ''}`,
      resourceType: 'transaction',
      resourceId: transactionId,
    });
  }

  // AM
  if (amId) {
    notifications.push({
      userId: amId,
      type: 'PAYMENT_RECEIVED',
      title: 'Client Payment Completed',
      message: `Client paid ${paymentType} for ${txRef}.`,
      resourceType: 'transaction',
      resourceId: transactionId,
    });
  }

  // Admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true },
  });
  for (const admin of admins) {
    notifications.push({
      userId: admin.id,
      type: 'PAYMENT_RECEIVED',
      title: 'Buyer Payment Submitted',
      message: `Buyer submitted ${paymentType} payment for ${txRef}. Verify and confirm.`,
      resourceType: 'transaction',
      resourceId: transactionId,
    });
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
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

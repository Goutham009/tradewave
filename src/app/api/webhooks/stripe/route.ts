import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmedEmail } from '@/lib/email/triggers';
import { finalizePayment } from '@/app/api/buyer/transactions/[id]/payment/route';
import {
  buildOrderReferences,
  formatQuotationReference,
  formatRequirementReference,
  formatTransactionReference,
} from '@/lib/flow-references';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!WEBHOOK_SECRET) {
    console.error('Stripe webhook secret is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const stripePaymentIntentId = paymentIntent.id;
  const { transactionId, buyerId, paymentType, escrowId } = paymentIntent.metadata;

  if (!transactionId) {
    console.error('Stripe webhook: missing transactionId in metadata');
    return;
  }

  // Find the PROCESSING payment record matching this Stripe PaymentIntent
  const payment = await prisma.payment.findFirst({
    where: {
      providerPaymentId: stripePaymentIntentId,
      status: 'PROCESSING',
    },
  });

  if (!payment) {
    console.warn(`Stripe webhook: no PROCESSING payment found for PI ${stripePaymentIntentId}`);
    return;
  }

  // Load transaction for references and stakeholder IDs
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      escrow: true,
      supplier: { select: { email: true } },
      requirement: { select: { assignedAccountManagerId: true } },
    },
  });

  if (!transaction || !transaction.escrow) {
    console.error(`Stripe webhook: transaction ${transactionId} or escrow not found`);
    return;
  }

  // Resolve supplier user ID
  let supplierUserId: string | null = null;
  if (transaction.supplier?.email) {
    const supplierUser = await prisma.user.findFirst({
      where: { role: 'SUPPLIER', email: transaction.supplier.email },
      select: { id: true },
    });
    supplierUserId = supplierUser?.id || null;
  }

  const references = {
    requirementReference: formatRequirementReference(transaction.requirementId),
    quotationReference: formatQuotationReference(transaction.quotationId),
    transactionReference: formatTransactionReference(transaction.id),
    ...buildOrderReferences(transaction.id),
  };

  await finalizePayment({
    paymentId: payment.id,
    transactionId,
    escrowId: escrowId || transaction.escrow.id,
    paymentType: paymentType || 'advance',
    amount: paymentIntent.amount / 100,
    buyerId: buyerId || transaction.buyerId,
    supplierUserId,
    amId: transaction.requirement?.assignedAccountManagerId || null,
    references,
  });

  // Send confirmation emails
  sendPaymentConfirmedEmail(transactionId).catch(console.error);

  console.log(`Stripe webhook: payment ${payment.id} finalized for transaction ${transactionId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const stripePaymentIntentId = paymentIntent.id;
  const { transactionId } = paymentIntent.metadata;
  let buyerUserId = paymentIntent.metadata.buyerId || null;

  // Mark the payment record as FAILED
  const payment = await prisma.payment.findFirst({
    where: {
      providerPaymentId: stripePaymentIntentId,
      status: 'PROCESSING',
    },
  });

  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      failedAt: new Date(),
      paidAt: null,
      metadata: {
        ...(payment.metadata as object || {}),
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      },
    },
  });

  // Revert transaction payment status
  if (transactionId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { buyerId: true },
    });
    if (transaction?.buyerId) {
      buyerUserId = transaction.buyerId;
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { paymentStatus: 'FAILED' },
    });

    // Notify buyer of failure
    if (buyerUserId) {
      await prisma.notification.create({
        data: {
          userId: buyerUserId,
          type: 'PAYMENT_FAILED',
          title: 'Payment Failed',
          message: `Your payment could not be processed. Reason: ${paymentIntent.last_payment_error?.message || 'Unknown error'}. Please try again.`,
          resourceType: 'transaction',
          resourceId: transactionId,
        },
      });
    }
  }

  console.log(`Stripe webhook: payment ${payment.id} marked FAILED`);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) return;

  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: paymentIntentId },
  });

  if (!payment) return;

  const refundedAmount = charge.amount_refunded / 100;
  const isFullRefund = charge.amount_refunded === charge.amount;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: isFullRefund ? 'REFUNDED' : payment.status,
      refundedAt: new Date(),
      refundAmount: refundedAmount,
      metadata: {
        ...(payment.metadata as object || {}),
        refundedAmount,
        refundedAt: new Date().toISOString(),
      },
    },
  });

  console.log(`Stripe webhook: charge refunded (${isFullRefund ? 'full' : 'partial'}) for payment ${payment.id}`);
}

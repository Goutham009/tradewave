import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/buyer/transactions/[id]/payment - Process buyer payment (advance or balance)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      paymentType, // 'advance' or 'balance'
      amount,
      paymentMethod, // 'STRIPE', 'BANK_TRANSFER', 'WIRE'
      buyerId,
    } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { escrow: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (!transaction.escrow) {
      return NextResponse.json({ error: 'Escrow not set up for this transaction' }, { status: 400 });
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
          buyerId,
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

      // TODO: Notify supplier to start production
      // TODO: Notify admin
      // TODO: Send payment confirmation email to buyer

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

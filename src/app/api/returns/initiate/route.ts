import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      transactionId, 
      reason, 
      description, 
      condition,
      photoUrls = [],
      refundMethod = 'ORIGINAL_PAYMENT'
    } = body;

    if (!transactionId || !reason || !description || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify transaction exists and belongs to user
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        supplier: true
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not your transaction' }, { status: 403 });
    }

    // Check if transaction is eligible for return
    if (!['COMPLETED', 'DELIVERED', 'QUALITY_APPROVED'].includes(transaction.status)) {
      return NextResponse.json(
        { error: 'Transaction not eligible for return' },
        { status: 400 }
      );
    }

    // Check if return already exists
    const existingReturn = await prisma.return.findFirst({
      where: { 
        transactionId,
        status: { notIn: ['REJECTED', 'CANCELLED', 'REFUNDED'] }
      }
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: 'Return already exists for this transaction' },
        { status: 400 }
      );
    }

    // Get seller's return policy
    const returnPolicy = await prisma.returnPolicy.findUnique({
      where: { sellerId: transaction.supplier.id }
    });

    // Calculate refund amounts
    const refundAmount = Number(transaction.amount);
    const restockingFee = returnPolicy 
      ? refundAmount * (Number(returnPolicy.restockingFeePct) / 100)
      : 0;
    const shippingFee = returnPolicy
      ? refundAmount * (Number(returnPolicy.shippingFeePct) / 100)
      : 0;
    const netRefundAmount = refundAmount - restockingFee - shippingFee;

    // Create return request
    const returnRequest = await prisma.return.create({
      data: {
        transactionId,
        reason,
        description,
        condition,
        photoUrls,
        refundAmount,
        refundMethod,
        restockingFeeApplied: restockingFee,
        shippingFeeDeducted: shippingFee,
        netRefundAmount,
        status: 'REQUESTED'
      },
      include: {
        transaction: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            supplier: { select: { companyName: true } }
          }
        }
      }
    });

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Initiate return error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate return' },
      { status: 500 }
    );
  }
}

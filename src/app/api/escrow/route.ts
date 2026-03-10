import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import * as escrowService from '@/lib/services/escrowService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (transactionId) {
      const escrow = await escrowService.getEscrowByTransaction(transactionId);

      return NextResponse.json(escrow);
    }

    // Get all escrow transactions for the user
    const escrows = await prisma.escrowTransaction.findMany({
      where: {
        transaction: {
          buyerId: session.user.id,
        },
      },
      include: {
        releaseConditions: true,
        transaction: {
          select: {
            id: true,
            status: true,
            requirement: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(escrows);
  } catch (error) {
    console.error('Failed to fetch escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, amount, currency } = body;
    const amountValue = Number(amount);

    if (!transactionId || !Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingEscrow = await escrowService.getEscrowByTransaction(transactionId);
    if (existingEscrow) {
      return NextResponse.json(
        { error: 'Escrow already exists for this transaction', escrowId: existingEscrow.id },
        { status: 409 }
      );
    }

    const escrowResult = await escrowService.createEscrow({
      transactionId,
      amount: amountValue,
      currency: currency || 'USD',
    });

    if (!escrowResult.success || !escrowResult.escrowId) {
      return NextResponse.json(
        { error: escrowResult.error || 'Failed to create escrow' },
        { status: 500 }
      );
    }

    // Create default release conditions
    await prisma.releaseCondition.createMany({
      data: [
        {
          escrowId: escrowResult.escrowId,
          type: 'DELIVERY_CONFIRMED',
          description: 'Delivery must be confirmed by buyer',
        },
        {
          escrowId: escrowResult.escrowId,
          type: 'QUALITY_APPROVED',
          description: 'Quality must be approved by buyer',
        },
        {
          escrowId: escrowResult.escrowId,
          type: 'DOCUMENTS_VERIFIED',
          description: 'All documents must be verified',
        },
      ],
    });

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowResult.escrowId },
      include: {
        releaseConditions: true,
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
          },
        },
      },
    });

    return NextResponse.json(escrow, { status: 201 });
  } catch (error) {
    console.error('Failed to create escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

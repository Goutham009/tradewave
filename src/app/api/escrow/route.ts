import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (transactionId) {
      const escrow = await prisma.escrowTransaction.findUnique({
        where: { transactionId },
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

    if (!transactionId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create escrow record
    const escrow = await prisma.escrowTransaction.create({
      data: {
        transactionId,
        totalAmount: amount,
        amount,
        currency: currency || 'USD',
        status: 'PENDING',
      },
    });

    // Create default release conditions
    await prisma.releaseCondition.createMany({
      data: [
        {
          escrowId: escrow.id,
          type: 'DELIVERY_CONFIRMED',
          description: 'Delivery must be confirmed by buyer',
        },
        {
          escrowId: escrow.id,
          type: 'QUALITY_APPROVED',
          description: 'Quality must be approved by buyer',
        },
        {
          escrowId: escrow.id,
          type: 'DOCUMENTS_VERIFIED',
          description: 'All documents must be verified',
        },
      ],
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

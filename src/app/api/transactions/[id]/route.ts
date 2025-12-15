import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        requirement: true,
        quotation: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        supplier: true,
        escrow: {
          include: {
            releaseConditions: true,
          },
        },
        milestones: {
          orderBy: { timestamp: 'desc' },
        },
        documents: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role === 'BUYER' &&
      transaction.buyerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, action } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { escrow: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Handle specific actions
    if (action === 'CONFIRM_DELIVERY') {
      // Mark delivery as confirmed
      await prisma.transaction.update({
        where: { id: params.id },
        data: { status: 'CONFIRMED' },
      });

      // Add milestone
      await prisma.transactionMilestone.create({
        data: {
          transactionId: params.id,
          status: 'CONFIRMED',
          description: 'Delivery confirmed by buyer',
        },
      });

      // Update escrow condition
      if (transaction.escrow) {
        await prisma.releaseCondition.updateMany({
          where: {
            escrowId: transaction.escrow.id,
            type: 'DELIVERY_CONFIRMED',
          },
          data: {
            satisfied: true,
            satisfiedAt: new Date(),
            satisfiedBy: session.user.id,
          },
        });
      }

      return NextResponse.json({ success: true, message: 'Delivery confirmed' });
    }

    if (action === 'APPROVE_QUALITY') {
      // Update escrow condition
      if (transaction.escrow) {
        await prisma.releaseCondition.updateMany({
          where: {
            escrowId: transaction.escrow.id,
            type: 'QUALITY_APPROVED',
          },
          data: {
            satisfied: true,
            satisfiedAt: new Date(),
            satisfiedBy: session.user.id,
          },
        });
      }

      return NextResponse.json({ success: true, message: 'Quality approved' });
    }

    // Generic status update
    if (status) {
      const updatedTransaction = await prisma.transaction.update({
        where: { id: params.id },
        data: { status },
      });

      // Add milestone
      await prisma.transactionMilestone.create({
        data: {
          transactionId: params.id,
          status,
          description: `Status updated to ${status}`,
        },
      });

      return NextResponse.json(updatedTransaction);
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

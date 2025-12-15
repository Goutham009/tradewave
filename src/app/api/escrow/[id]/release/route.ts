import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        releaseConditions: true,
        transaction: true,
      },
    });

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    // Check if all conditions are met
    const allConditionsMet = escrow.releaseConditions.every((c) => c.satisfied);

    if (!allConditionsMet) {
      return NextResponse.json(
        { error: 'Not all release conditions are satisfied' },
        { status: 400 }
      );
    }

    // Update escrow status
    const updatedEscrow = await prisma.escrowTransaction.update({
      where: { id: params.id },
      data: {
        status: 'RELEASED',
        releaseDate: new Date(),
      },
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: escrow.transactionId },
      data: { status: 'ESCROW_RELEASED' },
    });

    // Add milestone
    await prisma.transactionMilestone.create({
      data: {
        transactionId: escrow.transactionId,
        status: 'ESCROW_RELEASED',
        description: 'Escrow funds released to supplier',
      },
    });

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message: 'Escrow released successfully',
    });
  } catch (error) {
    console.error('Failed to release escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

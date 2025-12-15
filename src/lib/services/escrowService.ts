import prisma from '@/lib/db';
import { EscrowStatus } from '@prisma/client';

export interface CreateEscrowParams {
  transactionId: string;
  amount: number;
  currency: string;
}

export interface EscrowResult {
  success: boolean;
  escrowId?: string;
  error?: string;
}

export async function createEscrow(params: CreateEscrowParams): Promise<EscrowResult> {
  try {
    const { transactionId, amount, currency } = params;

    const escrow = await prisma.escrowTransaction.create({
      data: {
        transactionId,
        amount,
        currency,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      escrowId: escrow.id,
    };
  } catch (error: any) {
    console.error('Escrow creation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create escrow',
    };
  }
}

export async function holdFunds(escrowId: string): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: 'HELD',
        holdDate: new Date(),
      },
    });

    // Add release conditions
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

    return {
      success: true,
      escrowId: escrow.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to hold funds',
    };
  }
}

export async function markConditionMet(
  escrowId: string,
  conditionType: 'DELIVERY_CONFIRMED' | 'QUALITY_APPROVED' | 'DOCUMENTS_VERIFIED' | 'TIME_ELAPSED',
  satisfiedBy: string
): Promise<EscrowResult> {
  try {
    await prisma.releaseCondition.updateMany({
      where: {
        escrowId,
        type: conditionType,
      },
      data: {
        satisfied: true,
        satisfiedAt: new Date(),
        satisfiedBy,
      },
    });

    // Check if all conditions are met
    const allConditions = await prisma.releaseCondition.findMany({
      where: { escrowId },
    });

    const allMet = allConditions.every((c) => c.satisfied);

    if (allMet) {
      await prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: { status: 'RELEASING' },
      });
    }

    return {
      success: true,
      escrowId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark condition',
    };
  }
}

export async function releaseFunds(escrowId: string): Promise<EscrowResult> {
  try {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: { releaseConditions: true },
    });

    if (!escrow) {
      return { success: false, error: 'Escrow not found' };
    }

    const allMet = escrow.releaseConditions.every((c) => c.satisfied);

    if (!allMet) {
      return { success: false, error: 'Not all conditions are met' };
    }

    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: {
        status: 'RELEASED',
        releaseDate: new Date(),
      },
    });

    return {
      success: true,
      escrowId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to release funds',
    };
  }
}

export async function initiateDispute(
  escrowId: string,
  reason: string
): Promise<EscrowResult> {
  try {
    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { status: 'DISPUTED' },
    });

    return {
      success: true,
      escrowId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to initiate dispute',
    };
  }
}

export async function getEscrowStatus(escrowId: string) {
  const escrow = await prisma.escrowTransaction.findUnique({
    where: { id: escrowId },
    include: {
      releaseConditions: true,
      transaction: true,
    },
  });

  return escrow;
}

export async function getEscrowByTransaction(transactionId: string) {
  const escrow = await prisma.escrowTransaction.findUnique({
    where: { transactionId },
    include: {
      releaseConditions: true,
    },
  });

  return escrow;
}

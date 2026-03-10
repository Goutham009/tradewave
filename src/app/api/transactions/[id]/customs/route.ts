import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
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

    const transactionId = params.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        supplier: {
          select: {
            id: true,
            email: true,
          },
        },
        customsClearance: {
          include: {
            documents: true,
            timeline: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check authorization
    const userId = session.user.id;
    const userRole = session.user.role;
    const isSupplierOwner =
      !!session.user.email && transaction.supplier?.email === session.user.email;
    
    if (
      transaction.buyerId !== userId &&
      !isSupplierOwner &&
      !['ADMIN', 'ACCOUNT_MANAGER'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!transaction.customsClearance) {
      return NextResponse.json(
        { error: 'Customs clearance record not found for this transaction' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction.customsClearance);
  } catch (error) {
    console.error('Customs info error:', error);
    return NextResponse.json({ error: 'Failed to fetch customs information' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transactionId = params.id;
    const body = await request.json();

    const { entryNumber, portOfEntry, brokerName, dutyAmount, estimatedClearanceDate } = body;

    const customsClearance = await prisma.customsClearance.upsert({
      where: { transactionId },
      create: {
        transactionId,
        entryNumber,
        portOfEntry,
        brokerName,
        dutyAmount,
        estimatedClearanceDate: new Date(estimatedClearanceDate),
        status: 'PENDING',
      },
      update: {
        entryNumber,
        portOfEntry,
        brokerName,
        dutyAmount,
        estimatedClearanceDate: new Date(estimatedClearanceDate),
      },
    });

    return NextResponse.json({ success: true, customsClearance });
  } catch (error) {
    console.error('Customs update error:', error);
    return NextResponse.json({ error: 'Failed to update customs information' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transactionId = params.id;
    const body = await request.json();
    const { status, holdReason, actualClearanceDate } = body;

    const customsClearance = await prisma.customsClearance.update({
      where: { transactionId },
      data: {
        status,
        holdReason,
        actualClearanceDate: actualClearanceDate ? new Date(actualClearanceDate) : undefined,
      },
    });

    // If cleared, update the transaction
    if (status === 'CLEARED') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          // customsClearedAt would need to be added to Transaction model
        },
      });
    }

    return NextResponse.json({ success: true, customsClearance });
  } catch (error) {
    console.error('Customs status update error:', error);
    return NextResponse.json({ error: 'Failed to update customs status' }, { status: 500 });
  }
}

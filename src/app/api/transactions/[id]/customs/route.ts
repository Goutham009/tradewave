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
    
    if (
      transaction.buyerId !== userId &&
      transaction.supplierId !== userId &&
      !['ADMIN', 'ACCOUNT_MANAGER'].includes(userRole || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!transaction.customsClearance) {
      // Return mock data for demo if no customs clearance exists
      return NextResponse.json({
        entryNumber: `CE-${transactionId.slice(0, 8).toUpperCase()}`,
        portOfEntry: 'Los Angeles, CA',
        brokerName: 'Global Customs Brokers Inc.',
        status: 'DOCUMENTS_SUBMITTED',
        dutyAmount: 1250.00,
        estimatedClearanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [
          { name: 'Commercial Invoice', description: 'Original invoice from supplier', status: 'APPROVED' },
          { name: 'Packing List', description: 'Detailed list of shipment contents', status: 'APPROVED' },
          { name: 'Bill of Lading', description: 'Ocean cargo shipping document', status: 'SUBMITTED' },
          { name: 'Certificate of Origin', description: 'Country of manufacture certificate', status: 'PENDING' },
        ],
        timeline: [
          { title: 'Arrived at Port', description: 'Shipment arrived at port of entry', completed: true, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { title: 'Documents Submitted', description: 'Customs documentation submitted for review', completed: true, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { title: 'Under Review', description: 'Customs officials reviewing documentation', completed: false },
          { title: 'Duties Paid', description: 'Import duties and taxes paid', completed: false },
          { title: 'Cleared', description: 'Shipment cleared for delivery', completed: false },
        ],
      });
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

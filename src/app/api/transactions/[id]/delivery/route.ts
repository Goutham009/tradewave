import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = params.id;
    const body = await request.json();
    const {
      deliveryLocation,
      deliveryDate,
      notes,
      photos,
    } = body;

    // Validate required fields
    if (!deliveryLocation) {
      return NextResponse.json(
        { error: 'Delivery location is required' },
        { status: 400 }
      );
    }

    // Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        supplier: true,
        buyer: true,
        requirement: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user is the buyer
    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the buyer can confirm delivery' },
        { status: 403 }
      );
    }

    // Verify transaction is in correct status
    const validStatuses = ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'];
    if (!validStatuses.includes(transaction.status)) {
      return NextResponse.json(
        { error: `Cannot confirm delivery for transaction in ${transaction.status} status` },
        { status: 400 }
      );
    }

    const oldStatus = transaction.status;

    // Update transaction - set to DELIVERY_CONFIRMED then QUALITY_PENDING
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'QUALITY_PENDING',
        deliveryConfirmedAt: new Date(),
        deliveryConfirmedById: session.user.id,
        deliveryLocation,
        deliveryNotes: notes || null,
        deliveryPhotos: photos || [],
        actualDelivery: deliveryDate ? new Date(deliveryDate) : new Date(),
      },
      include: {
        supplier: true,
        buyer: true,
        requirement: true,
        quotation: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // Create status history records
    await prisma.transactionStatusHistory.createMany({
      data: [
        {
          transactionId,
          oldStatus: oldStatus as any,
          newStatus: 'DELIVERY_CONFIRMED',
          changedById: session.user.id,
          reason: `Delivery confirmed at ${deliveryLocation}`,
          metadata: { deliveryLocation, deliveryDate },
        },
        {
          transactionId,
          oldStatus: 'DELIVERY_CONFIRMED',
          newStatus: 'QUALITY_PENDING',
          changedById: session.user.id,
          reason: 'Quality assessment pending',
        },
      ],
    });

    // Update escrow if exists
    await prisma.escrowTransaction.updateMany({
      where: { transactionId },
      data: {
        deliveryConfirmed: true,
        deliveryConfirmedAt: new Date(),
      },
    });

    // Update shipment status
    await prisma.shipment.updateMany({
      where: { transactionId },
      data: {
        status: 'DELIVERED',
        actualDelivery: deliveryDate ? new Date(deliveryDate) : new Date(),
        currentLocation: deliveryLocation,
      },
    });

    // Create transaction milestones
    await prisma.transactionMilestone.createMany({
      data: [
        {
          transactionId,
          status: 'DELIVERY_CONFIRMED',
          description: `Delivery confirmed by buyer at ${deliveryLocation}`,
          actor: session.user.id,
        },
        {
          transactionId,
          status: 'QUALITY_PENDING',
          description: 'Quality assessment required within 7 days',
          actor: session.user.id,
        },
      ],
    });

    // Emit Socket.io events
    try {
      // Notify supplier
      emitToUser(transaction.supplierId, 'deliveryConfirmed', {
        transactionId,
        transaction: updatedTransaction,
        deliveryLocation,
        timestamp: new Date(),
      });

      // Notify buyer about quality assessment
      emitToUser(transaction.buyerId, 'qualityAssessmentStarted', {
        transactionId,
        transaction: updatedTransaction,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        timestamp: new Date(),
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    // TODO: Send email notifications
    // await sendDeliveryConfirmedEmail(transactionId);
    // await sendQualityAssessmentEmail(transactionId);

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Delivery confirmed. Please assess the quality of goods within 7 days.',
      qualityDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Delivery confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm delivery' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: {
        deliveryConfirmedAt: true,
        deliveryConfirmedById: true,
        deliveryLocation: true,
        deliveryNotes: true,
        deliveryPhotos: true,
        actualDelivery: true,
        deliveryConfirmedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      delivery: {
        confirmedAt: transaction.deliveryConfirmedAt,
        confirmedBy: transaction.deliveryConfirmedBy,
        location: transaction.deliveryLocation,
        notes: transaction.deliveryNotes,
        photos: transaction.deliveryPhotos,
        actualDelivery: transaction.actualDelivery,
      },
    });
  } catch (error) {
    console.error('Get delivery error:', error);
    return NextResponse.json(
      { error: 'Failed to get delivery details' },
      { status: 500 }
    );
  }
}

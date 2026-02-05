import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';
import { getTrackingService } from '@/lib/logistics/tracking';

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
      trackingNumber,
      trackingUrl,
      shippingProvider,
      estimatedDelivery,
      notes,
      photos,
    } = body;

    // Validate required fields
    if (!trackingNumber || trackingNumber.length < 3) {
      return NextResponse.json(
        { error: 'Valid tracking number is required (min 3 characters)' },
        { status: 400 }
      );
    }

    if (!shippingProvider) {
      return NextResponse.json(
        { error: 'Shipping provider is required' },
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
        quotation: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user is the supplier
    if (transaction.supplier.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Only the supplier can confirm shipment' },
        { status: 403 }
      );
    }

    // Verify transaction is in correct status
    const validStatuses = ['PAID', 'PAYMENT_RECEIVED', 'ESCROW_HELD', 'PRODUCTION'];
    if (!validStatuses.includes(transaction.status)) {
      return NextResponse.json(
        { error: `Cannot ship transaction in ${transaction.status} status` },
        { status: 400 }
      );
    }

    const oldStatus = transaction.status;

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'SHIPPED',
        trackingNumber,
        trackingUrl: trackingUrl || null,
        shippingProvider,
        shipmentDate: new Date(),
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        shipmentNotes: notes || null,
        shipmentPhotos: photos || [],
        carrier: shippingProvider,
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

    // Create status history record
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId,
        oldStatus: oldStatus as any,
        newStatus: 'SHIPPED',
        changedById: session.user.id,
        reason: `Shipment confirmed with tracking: ${trackingNumber}`,
        metadata: {
          trackingNumber,
          shippingProvider,
          estimatedDelivery,
        },
      },
    });

    // Create or update shipment record
    await prisma.shipment.upsert({
      where: { transactionId },
      create: {
        transactionId,
        trackingNumber,
        carrier: shippingProvider,
        status: 'PICKED_UP',
        originLocation: transaction.origin || 'Supplier Location',
        currentLocation: transaction.origin || 'Supplier Location',
        destinationLocation: transaction.destination || transaction.requirement.deliveryLocation,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      update: {
        trackingNumber,
        carrier: shippingProvider,
        status: 'PICKED_UP',
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      },
    });

    // Create transaction milestone
    await prisma.transactionMilestone.create({
      data: {
        transactionId,
        status: 'SHIPPED',
        description: `Order shipped via ${shippingProvider}. Tracking: ${trackingNumber}`,
        actor: session.user.id,
      },
    });

    // Emit Socket.io event to buyer
    try {
      emitToUser(transaction.buyerId, 'shipmentConfirmed', {
        transactionId,
        transaction: updatedTransaction,
        trackingNumber,
        shippingProvider,
        estimatedDelivery,
        timestamp: new Date(),
      });
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
    }

    // TODO: Send email notification to buyer
    // await sendShipmentConfirmedEmail(transactionId);

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Shipment confirmed successfully',
    });
  } catch (error) {
    console.error('Shipment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm shipment' },
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
        trackingNumber: true,
        trackingUrl: true,
        shippingProvider: true,
        shipmentDate: true,
        estimatedDelivery: true,
        shipmentNotes: true,
        shipmentPhotos: true,
        shipment: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // If we have tracking info, fetch real-time data from carrier
    if (transaction.trackingNumber && transaction.shippingProvider) {
      try {
        const trackingService = getTrackingService();
        const liveTracking = await trackingService.trackShipment(
          transaction.trackingNumber,
          transaction.shippingProvider
        );

        // Update shipment record with latest info
        if (transaction.shipment) {
          await prisma.shipment.update({
            where: { id: transaction.shipment.id },
            data: {
              status: liveTracking.status,
              currentLocation: liveTracking.currentLocation,
              estimatedDelivery: liveTracking.estimatedDelivery,
              lastUpdated: new Date(),
            },
          });
        }

        return NextResponse.json({
          trackingNumber: liveTracking.trackingNumber,
          carrier: liveTracking.carrier,
          status: liveTracking.status,
          origin: liveTracking.origin,
          destination: liveTracking.destination,
          estimatedDelivery: liveTracking.estimatedDelivery,
          currentLocation: liveTracking.currentLocation,
          updates: liveTracking.updates,
        });
      } catch (trackingError) {
        console.error('Live tracking error:', trackingError);
        // Fall through to return stored data
      }
    }

    return NextResponse.json({
      trackingNumber: transaction.trackingNumber,
      carrier: transaction.shippingProvider,
      status: transaction.shipment?.status || 'IN_TRANSIT',
      origin: transaction.shipment?.originLocation || 'Origin',
      destination: transaction.shipment?.destinationLocation || 'Destination',
      estimatedDelivery: transaction.estimatedDelivery,
      currentLocation: transaction.shipment?.currentLocation || 'In Transit',
      updates: [],
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to get shipment details' },
      { status: 500 }
    );
  }
}

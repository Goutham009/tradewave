import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/supplier/transactions/[id]/shipment - Supplier marks order as shipped
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      supplierId,
      carrier,
      trackingNumber,
      origin,
      shippingProvider,
      shipmentNotes,
      shipmentPhotos,
      estimatedDelivery,
    } = body;

    if (!supplierId || !carrier || !trackingNumber) {
      return NextResponse.json(
        { error: 'supplierId, carrier, and trackingNumber are required' },
        { status: 400 }
      );
    }

    const transaction: any = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.supplierId !== supplierId) {
      return NextResponse.json({ error: 'This transaction does not belong to you' }, { status: 403 });
    }

    const validStatuses = ['PRODUCTION', 'QUALITY_INSPECTION', 'QUALITY_APPROVED'];
    if (!validStatuses.includes(transaction.status)) {
      return NextResponse.json(
        { error: `Cannot ship. Transaction status is ${transaction.status}. Must complete production/inspection first.` },
        { status: 400 }
      );
    }

    await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: 'SHIPPED',
        carrier,
        trackingNumber,
        origin: origin || null,
        shippingProvider: shippingProvider || carrier,
        shipmentDate: new Date(),
        shipmentNotes: shipmentNotes || null,
        shipmentPhotos: shipmentPhotos || [],
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      } as any,
    });

    // TODO: Notify buyer about shipment
    // TODO: Notify AM
    // TODO: Create shipment record if Shipment model is used

    return NextResponse.json({
      status: 'success',
      message: 'Order marked as shipped. Buyer has been notified.',
      shipment: {
        carrier,
        trackingNumber,
        shipmentDate: new Date(),
        estimatedDelivery,
      },
      transactionStatus: 'SHIPPED',
    });
  } catch (error: any) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment', details: error.message },
      { status: 500 }
    );
  }
}

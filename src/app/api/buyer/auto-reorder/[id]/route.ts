import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/auto-reorder/:id - Get auto-reorder details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const autoReorder = await prisma.autoReorder.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true,
            email: true
          }
        },
        orders: {
          orderBy: { orderDate: 'desc' },
          include: {
            transaction: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!autoReorder) {
      return NextResponse.json({ error: 'Auto-reorder not found' }, { status: 404 });
    }

    if (autoReorder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ autoReorder });
  } catch (error) {
    console.error('Error fetching auto-reorder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-reorder' },
      { status: 500 }
    );
  }
}

// PATCH /api/buyer/auto-reorder/:id - Update auto-reorder
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const autoReorder = await prisma.autoReorder.findUnique({
      where: { id }
    });

    if (!autoReorder) {
      return NextResponse.json({ error: 'Auto-reorder not found' }, { status: 404 });
    }

    if (autoReorder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await prisma.autoReorder.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        quantityPerOrder: body.quantityPerOrder,
        unitPrice: body.unitPrice,
        estimatedTotal: body.quantityPerOrder && body.unitPrice 
          ? body.quantityPerOrder * body.unitPrice 
          : undefined,
        frequency: body.frequency,
        customIntervalDays: body.customIntervalDays,
        nextOrderDate: body.nextOrderDate ? new Date(body.nextOrderDate) : undefined,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity,
        deliveryRegion: body.deliveryRegion,
        deliveryCountry: body.deliveryCountry,
        paymentTerms: body.paymentTerms,
        autoChargeEnabled: body.autoChargeEnabled,
        maxOrders: body.maxOrders,
        endDate: body.endDate ? new Date(body.endDate) : undefined
      }
    });

    return NextResponse.json({ autoReorder: updated });
  } catch (error) {
    console.error('Error updating auto-reorder:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-reorder' },
      { status: 500 }
    );
  }
}

// DELETE /api/buyer/auto-reorder/:id - Cancel auto-reorder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const autoReorder = await prisma.autoReorder.findUnique({
      where: { id }
    });

    if (!autoReorder) {
      return NextResponse.json({ error: 'Auto-reorder not found' }, { status: 404 });
    }

    if (autoReorder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.autoReorder.update({
      where: { id },
      data: {
        status: 'STOPPED',
        endDate: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling auto-reorder:', error);
    return NextResponse.json(
      { error: 'Failed to cancel auto-reorder' },
      { status: 500 }
    );
  }
}

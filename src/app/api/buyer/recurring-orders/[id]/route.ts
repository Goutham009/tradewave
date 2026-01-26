import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/recurring-orders/:id - Get recurring order details
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

    const recurringOrder = await prisma.recurringOrder.findUnique({
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
        lineItems: true,
        billingHistory: {
          orderBy: { billingDate: 'desc' },
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

    if (!recurringOrder) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    if (recurringOrder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ recurringOrder });
  } catch (error) {
    console.error('Error fetching recurring order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring order' },
      { status: 500 }
    );
  }
}

// PATCH /api/buyer/recurring-orders/:id - Update recurring order
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

    const recurringOrder = await prisma.recurringOrder.findUnique({
      where: { id }
    });

    if (!recurringOrder) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    if (recurringOrder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await prisma.recurringOrder.update({
      where: { id },
      data: {
        subscriptionName: body.subscriptionName,
        description: body.description,
        frequency: body.frequency,
        customIntervalDays: body.customIntervalDays,
        dayOfWeek: body.dayOfWeek,
        dayOfMonth: body.dayOfMonth,
        nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
        subscriptionDiscount: body.subscriptionDiscount,
        autoChargeEnabled: body.autoChargeEnabled,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity,
        deliveryRegion: body.deliveryRegion,
        deliveryCountry: body.deliveryCountry
      },
      include: {
        lineItems: true
      }
    });

    return NextResponse.json({ recurringOrder: updated });
  } catch (error) {
    console.error('Error updating recurring order:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring order' },
      { status: 500 }
    );
  }
}

// DELETE /api/buyer/recurring-orders/:id - Cancel recurring order
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
    const body = await request.json().catch(() => ({}));

    const recurringOrder = await prisma.recurringOrder.findUnique({
      where: { id }
    });

    if (!recurringOrder) {
      return NextResponse.json({ error: 'Recurring order not found' }, { status: 404 });
    }

    if (recurringOrder.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.recurringOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: body.reason || null,
        endDate: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling recurring order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel recurring order' },
      { status: 500 }
    );
  }
}

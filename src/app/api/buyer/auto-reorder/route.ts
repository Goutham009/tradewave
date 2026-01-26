import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { ReorderFrequency } from '@prisma/client';

// GET /api/buyer/auto-reorder - List all auto-reorders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      buyerId: session.user.id
    };

    if (status) {
      where.status = status;
    }

    const autoReorders = await prisma.autoReorder.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true
          }
        },
        orders: {
          orderBy: { orderDate: 'desc' },
          take: 5
        }
      },
      orderBy: { nextOrderDate: 'asc' }
    });

    return NextResponse.json({ autoReorders });
  } catch (error) {
    console.error('Error fetching auto-reorders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-reorders' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/auto-reorder - Create new auto-reorder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      supplierId,
      productName,
      productSKU,
      productCategory,
      quantityPerOrder,
      quantityUnit,
      unitPrice,
      currency,
      frequency,
      customIntervalDays,
      deliveryAddress,
      deliveryCity,
      deliveryRegion,
      deliveryCountry,
      paymentTerms,
      autoChargeEnabled,
      autoChargePaymentMethod,
      maxOrders,
      startDate
    } = body;

    // Validate required fields
    if (!name || !supplierId || !productName || !productCategory || !quantityPerOrder || !unitPrice || !currency || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate next order date based on frequency
    const start = startDate ? new Date(startDate) : new Date();
    let nextOrderDate = new Date(start);

    switch (frequency) {
      case 'WEEKLY':
        nextOrderDate.setDate(nextOrderDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextOrderDate.setMonth(nextOrderDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextOrderDate.setMonth(nextOrderDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextOrderDate.setFullYear(nextOrderDate.getFullYear() + 1);
        break;
      case 'CUSTOM':
        if (customIntervalDays) {
          nextOrderDate.setDate(nextOrderDate.getDate() + customIntervalDays);
        }
        break;
    }

    const estimatedTotal = quantityPerOrder * unitPrice;

    const autoReorder = await prisma.autoReorder.create({
      data: {
        buyerId: session.user.id,
        name,
        description,
        supplierId,
        productName,
        productSKU,
        productCategory,
        quantityPerOrder,
        quantityUnit: quantityUnit || 'pcs',
        unitPrice,
        estimatedTotal,
        currency,
        frequency: frequency as ReorderFrequency,
        customIntervalDays,
        nextOrderDate,
        deliveryAddress,
        deliveryCity,
        deliveryRegion,
        deliveryCountry,
        paymentTerms,
        autoChargeEnabled: autoChargeEnabled || false,
        autoChargePaymentMethod,
        maxOrders,
        startDate: start
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    });

    return NextResponse.json({ autoReorder }, { status: 201 });
  } catch (error) {
    console.error('Error creating auto-reorder:', error);
    return NextResponse.json(
      { error: 'Failed to create auto-reorder' },
      { status: 500 }
    );
  }
}

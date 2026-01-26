import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { ReorderFrequency } from '@prisma/client';

// GET /api/buyer/recurring-orders - List recurring orders
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

    const recurringOrders = await prisma.recurringOrder.findMany({
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
        lineItems: true,
        billingHistory: {
          orderBy: { billingDate: 'desc' },
          take: 5
        }
      },
      orderBy: { nextBillingDate: 'asc' }
    });

    return NextResponse.json({ recurringOrders });
  } catch (error) {
    console.error('Error fetching recurring orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring orders' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/recurring-orders - Create recurring order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subscriptionName,
      description,
      supplierId,
      lineItems,
      frequency,
      customIntervalDays,
      dayOfWeek,
      dayOfMonth,
      currency,
      subscriptionDiscount,
      autoChargeEnabled,
      paymentMethod,
      deliveryAddress,
      deliveryCity,
      deliveryRegion,
      deliveryCountry,
      startDate
    } = body;

    // Validate required fields
    if (!subscriptionName || !supplierId || !lineItems?.length || !frequency || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = lineItems.reduce((sum: number, item: { quantity: number; unitPrice: number }) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    // Calculate next billing date
    const start = startDate ? new Date(startDate) : new Date();
    let nextBillingDate = new Date(start);

    switch (frequency) {
      case 'WEEKLY':
        nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
      case 'CUSTOM':
        if (customIntervalDays) {
          nextBillingDate.setDate(nextBillingDate.getDate() + customIntervalDays);
        }
        break;
    }

    const recurringOrder = await prisma.recurringOrder.create({
      data: {
        buyerId: session.user.id,
        subscriptionName,
        description,
        supplierId,
        frequency: frequency as ReorderFrequency,
        customIntervalDays,
        dayOfWeek,
        dayOfMonth,
        nextBillingDate,
        totalAmount,
        currency,
        subscriptionDiscount,
        autoChargeEnabled: autoChargeEnabled || false,
        paymentMethod,
        deliveryAddress,
        deliveryCity,
        deliveryRegion,
        deliveryCountry,
        startDate: start,
        lineItems: {
          create: lineItems.map((item: {
            productSKU?: string;
            productName: string;
            productCategory: string;
            quantity: number;
            quantityUnit?: string;
            unitPrice: number;
          }) => ({
            productSKU: item.productSKU,
            productName: item.productName,
            productCategory: item.productCategory,
            quantity: item.quantity,
            quantityUnit: item.quantityUnit || 'pcs',
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        },
        lineItems: true
      }
    });

    return NextResponse.json({ recurringOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring order:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring order' },
      { status: 500 }
    );
  }
}

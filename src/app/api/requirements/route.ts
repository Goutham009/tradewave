import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      buyerId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          quotations: {
            select: {
              id: true,
              status: true,
              total: true,
            },
          },
          _count: {
            select: {
              quotations: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.requirement.count({ where }),
    ]);

    return NextResponse.json({
      requirements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch requirements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategory,
      specifications,
      quantity,
      unit,
      targetPrice,
      currency,
      deliveryLocation,
      deliveryDeadline,
      priority,
    } = body;

    if (!title || !description || !category || !quantity || !deliveryLocation || !deliveryDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const requirement = await prisma.requirement.create({
      data: {
        buyerId: session.user.id,
        title,
        description,
        category,
        subcategory,
        specifications: specifications || {},
        quantity,
        unit: unit || 'pcs',
        targetPrice: targetPrice || null,
        currency: currency || 'USD',
        deliveryLocation,
        deliveryDeadline: new Date(deliveryDeadline),
        priority: priority || 'MEDIUM',
        status: 'DRAFT',
      },
    });

    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    console.error('Failed to create requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

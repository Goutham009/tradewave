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
    const requirementId = searchParams.get('requirementId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    // For buyers, only show quotations for their requirements
    if (session.user.role === 'BUYER') {
      where.requirement = {
        buyerId: session.user.id,
      };
    }

    if (requirementId) {
      where.requirementId = requirementId;
    }

    if (status) {
      where.status = status;
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          requirement: {
            select: {
              id: true,
              title: true,
              category: true,
              quantity: true,
              unit: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    return NextResponse.json({
      quotations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch quotations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      requirementId,
      supplierId,
      unitPrice,
      quantity,
      currency,
      leadTime,
      validUntil,
      notes,
      terms,
    } = body;

    if (!requirementId || !supplierId || !unitPrice || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const total = unitPrice * quantity;

    const quotation = await prisma.quotation.create({
      data: {
        requirementId,
        supplierId,
        unitPrice,
        quantity,
        total,
        currency: currency || 'USD',
        leadTime: leadTime || null,
        ...(validUntil && { validUntil: new Date(validUntil) }),
        notes: notes || null,
        terms: terms || null,
        status: 'SUBMITTED',
      },
      include: {
        requirement: true,
        supplier: true,
      },
    });

    // Update requirement status
    await prisma.requirement.update({
      where: { id: requirementId },
      data: { status: 'QUOTATIONS_READY' },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error('Failed to create quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          requirement: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          quotation: {
            select: {
              id: true,
              unitPrice: true,
              quantity: true,
              total: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          escrow: {
            select: {
              id: true,
              status: true,
              amount: true,
            },
          },
          milestones: {
            orderBy: { timestamp: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
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
    const { requirementId, quotationId, supplierId } = body;

    if (!requirementId || !quotationId || !supplierId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get quotation details
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        requirementId,
        quotationId,
        buyerId: session.user.id,
        supplierId,
        status: 'INITIATED',
        amount: quotation.total,
        currency: quotation.currency,
      },
    });

    // Create initial milestone
    await prisma.transactionMilestone.create({
      data: {
        transactionId: transaction.id,
        status: 'INITIATED',
        description: 'Transaction initiated',
      },
    });

    // Update quotation status
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'ACCEPTED' },
    });

    // Update requirement status
    await prisma.requirement.update({
      where: { id: requirementId },
      data: { status: 'ACCEPTED' },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

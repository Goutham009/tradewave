import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                companyName: true,
              },
            },
          },
        },
        supplier: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role === 'BUYER' &&
      quotation.requirement.buyerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Failed to fetch quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Check authorization - only requirement owner can accept/reject
    if (
      session.user.role === 'BUYER' &&
      quotation.requirement.buyerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedQuotation = await prisma.quotation.update({
      where: { id: params.id },
      data: { status },
    });

    // If accepted, update requirement and potentially create transaction
    if (status === 'ACCEPTED') {
      await prisma.requirement.update({
        where: { id: quotation.requirementId },
        data: { status: 'ACCEPTED' },
      });

      // Reject other quotations for the same requirement
      await prisma.quotation.updateMany({
        where: {
          requirementId: quotation.requirementId,
          id: { not: params.id },
          status: { in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'] },
        },
        data: { status: 'REJECTED' },
      });
    }

    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error('Failed to update quotation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

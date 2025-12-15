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

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        quotations: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                companyName: true,
                verified: true,
              },
            },
          },
        },
        attachments: true,
        transactions: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Check authorization
    if (session.user.role === 'BUYER' && requirement.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Failed to fetch requirement:', error);
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

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Check authorization
    if (session.user.role === 'BUYER' && requirement.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      status,
    } = body;

    const updatedRequirement = await prisma.requirement.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(specifications && { specifications }),
        ...(quantity && { quantity }),
        ...(unit && { unit }),
        ...(targetPrice && { targetPrice }),
        ...(currency && { currency }),
        ...(deliveryLocation && { deliveryLocation }),
        ...(deliveryDeadline && { deliveryDeadline: new Date(deliveryDeadline) }),
        ...(priority && { priority }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedRequirement);
  } catch (error) {
    console.error('Failed to update requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Check authorization
    if (session.user.role === 'BUYER' && requirement.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow deletion of draft requirements
    if (requirement.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft requirements' },
        { status: 400 }
      );
    }

    await prisma.requirement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

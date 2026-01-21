import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// Standard response helpers
function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number, details?: any) {
  return NextResponse.json({ status: 'error', error: message, details }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            phone: true,
          },
        },
        quotations: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                companyName: true,
                location: true,
                verified: true,
                overallRating: true,
                totalReviews: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        transactions: {
          select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!requirement) {
      return errorResponse('Requirement not found', 404);
    }

    // Check authorization - Buyers see own, Suppliers see open ones, Admin sees all
    if (session.user.role === 'BUYER' && requirement.buyerId !== session.user.id) {
      return errorResponse('Forbidden: You can only view your own requirements', 403);
    }

    return successResponse({ requirement });
  } catch (error) {
    console.error('Failed to fetch requirement:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: { transactions: true },
    });

    if (!requirement) {
      return errorResponse('Requirement not found', 404);
    }

    // Check authorization - only owner or admin can update
    if (session.user.role === 'BUYER' && requirement.buyerId !== session.user.id) {
      return errorResponse('Forbidden: You can only update your own requirements', 403);
    }

    // Check if requirement can be updated (no active transactions)
    const hasActiveTransactions = requirement.transactions.some(
      t => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(t.status)
    );
    
    if (hasActiveTransactions && session.user.role !== 'ADMIN') {
      return errorResponse('Cannot update requirement with active transactions', 409);
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

    // Validate status transitions
    const validStatusTransitions: Record<string, string[]> = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['UNDER_REVIEW', 'SOURCING', 'CANCELLED'],
      UNDER_REVIEW: ['SOURCING', 'CANCELLED'],
      SOURCING: ['QUOTATIONS_READY', 'CANCELLED'],
      QUOTATIONS_READY: ['NEGOTIATING', 'ACCEPTED', 'CANCELLED'],
      NEGOTIATING: ['ACCEPTED', 'CANCELLED'],
    };

    if (status && status !== requirement.status) {
      const allowedTransitions = validStatusTransitions[requirement.status] || [];
      if (!allowedTransitions.includes(status) && session.user.role !== 'ADMIN') {
        return errorResponse(
          `Invalid status transition from ${requirement.status} to ${status}`,
          400
        );
      }
    }

    const updatedRequirement = await prisma.requirement.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(specifications && { specifications }),
        ...(quantity && { quantity }),
        ...(unit && { unit }),
        ...(targetPrice !== undefined && { targetPrice }),
        ...(currency && { currency }),
        ...(deliveryLocation && { deliveryLocation }),
        ...(deliveryDeadline && { deliveryDeadline: new Date(deliveryDeadline) }),
        ...(priority && { priority }),
        ...(status && { status }),
      },
      include: {
        buyer: {
          select: { id: true, name: true, companyName: true },
        },
        quotations: {
          select: { id: true, status: true, total: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'REQUIREMENT',
        action: 'UPDATE',
        description: `Updated requirement: ${updatedRequirement.title}`,
        resourceType: 'requirement',
        resourceId: requirement.id,
        metadata: { changes: Object.keys(body) },
      },
    });

    return successResponse({ requirement: updatedRequirement });
  } catch (error) {
    console.error('Failed to update requirement:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        transactions: true,
        quotations: true,
      },
    });

    if (!requirement) {
      return errorResponse('Requirement not found', 404);
    }

    // Check authorization
    if (session.user.role === 'BUYER' && requirement.buyerId !== session.user.id) {
      return errorResponse('Forbidden: You can only delete your own requirements', 403);
    }

    // Only allow deletion of draft or cancelled requirements with no transactions
    if (!['DRAFT', 'CANCELLED'].includes(requirement.status)) {
      return errorResponse(
        'Can only delete draft or cancelled requirements',
        400
      );
    }

    if (requirement.transactions.length > 0) {
      return errorResponse(
        'Cannot delete requirement with existing transactions',
        409
      );
    }

    // Delete related quotations first
    await prisma.quotation.deleteMany({
      where: { requirementId: params.id },
    });

    // Delete attachments
    await prisma.attachment.deleteMany({
      where: { requirementId: params.id },
    });

    // Delete the requirement
    await prisma.requirement.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'REQUIREMENT',
        action: 'DELETE',
        description: `Deleted requirement: ${requirement.title}`,
        resourceType: 'requirement',
        resourceId: params.id,
      },
    });

    return successResponse({ deleted: true, id: params.id });
  } catch (error) {
    console.error('Failed to delete requirement:', error);
    return errorResponse('Internal server error', 500);
  }
}

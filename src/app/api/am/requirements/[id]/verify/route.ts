import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatRequirementReference } from '@/lib/flow-references';

// GET /api/am/requirements/[id]/verify - Get requirement details for AM verification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ACCOUNT_MANAGER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        quotations: {
          select: { id: true, status: true },
        },
        attachments: true,
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (
      session.user.role === 'ACCOUNT_MANAGER' &&
      requirement.assignedAccountManagerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch buyer history
    const buyerStats = await prisma.transaction.aggregate({
      where: { buyerId: requirement.buyerId },
      _count: true,
      _sum: { amount: true },
    });

    const completedOrders = await prisma.transaction.count({
      where: { buyerId: requirement.buyerId, status: 'COMPLETED' },
    });

    const lastTransaction = await prisma.transaction.findFirst({
      where: { buyerId: requirement.buyerId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, amount: true, createdAt: true },
    });

    // If reorder, fetch original transaction details
    let originalTransaction = null;
    if ((requirement as any).isReorder && (requirement as any).originalTransactionId) {
      originalTransaction = await prisma.transaction.findUnique({
        where: { id: (requirement as any).originalTransactionId },
        include: {
          quotation: {
            include: {
              supplier: {
                select: { id: true, name: true, companyName: true },
              },
            },
          },
          review: {
            select: { overallRating: true, description: true },
          },
        },
      });
    }

    return NextResponse.json({
      requirement,
      buyerHistory: {
        totalOrders: buyerStats._count,
        totalSpent: buyerStats._sum?.amount || 0,
        completedOrders,
        lastTransaction,
        isExistingBuyer: buyerStats._count > 0,
      },
      originalTransaction,
    });
  } catch (error: any) {
    console.error('Failed to fetch requirement for verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/am/requirements/[id]/verify - AM verifies/approves/rejects a requirement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ACCOUNT_MANAGER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, amNotes, checklist } = body;
    // action: 'approve' | 'reject' | 'request_changes'

    if (!action || !['approve', 'reject', 'request_changes'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve, reject, or request_changes' },
        { status: 400 }
      );
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    if (
      session.user.role === 'ACCOUNT_MANAGER' &&
      requirement.assignedAccountManagerId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (requirement.status !== 'PENDING_AM_VERIFICATION' && requirement.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: `Cannot verify requirement in ${requirement.status} status` },
        { status: 400 }
      );
    }

    let updateData: any = {
      amNotes: amNotes || null,
    };

    switch (action) {
      case 'approve':
        updateData = {
          ...updateData,
          status: 'PENDING_ADMIN_REVIEW',
          amVerified: true,
          amVerifiedAt: new Date(),
        };
        break;
      case 'reject':
        updateData = {
          ...updateData,
          status: 'REJECTED',
          amVerified: false,
        };
        break;
      case 'request_changes':
        updateData = {
          ...updateData,
          status: 'DRAFT', // Send back to buyer for edits
          amVerified: false,
        };
        break;
    }

    const updated = await prisma.requirement.update({
      where: { id: params.id },
      data: updateData,
    });
    const requirementRef = formatRequirementReference(updated.id);

    // Send notifications based on action
    if (action === 'approve') {
      // Notify admins for review
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'REQUIREMENT_CREATED',
            title: 'Requirement Ready for Review',
            message: `Requirement ${requirementRef} ("${requirement.title}") has been verified by AM and is ready for admin review.`,
            resourceType: 'requirement',
            resourceId: params.id
          }
        });
      }
    } else if (action === 'reject') {
      // Notify buyer of rejection
      await prisma.notification.create({
        data: {
          userId: requirement.buyerId,
          type: 'REQUIREMENT_CREATED',
          title: 'Requirement Rejected',
          message: `Your requirement ${requirementRef} ("${requirement.title}") has been rejected. ${amNotes ? `Reason: ${amNotes}` : ''}`,
          resourceType: 'requirement',
          resourceId: params.id
        }
      });
    } else if (action === 'request_changes') {
      // Notify buyer to make changes
      await prisma.notification.create({
        data: {
          userId: requirement.buyerId,
          type: 'REQUIREMENT_CREATED',
          title: 'Changes Requested',
          message: `Changes have been requested for your requirement ${requirementRef} ("${requirement.title}"). ${amNotes ? `Details: ${amNotes}` : ''}`,
          resourceType: 'requirement',
          resourceId: params.id
        }
      });
    }

    return NextResponse.json({
      status: 'success',
      action,
      requirement: {
        id: updated.id,
        referenceId: requirementRef,
        title: updated.title,
        status: updated.status,
        amVerified: updated.amVerified,
        amVerifiedAt: updated.amVerifiedAt,
      },
      message: action === 'approve'
        ? 'Requirement approved and submitted for admin review.'
        : action === 'reject'
        ? 'Requirement rejected.'
        : 'Changes requested from buyer.',
    });
  } catch (error: any) {
    console.error('AM verification failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify requirement', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ returnId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { returnId } = await params;
    const body = await request.json();
    const { approve, rejectionReason } = body;

    const returnRequest = await prisma.return.findUnique({
      where: { id: returnId },
      include: {
        transaction: {
          include: { supplier: true }
        }
      }
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    // Check authorization (seller or admin)
    const isSeller = returnRequest.transaction.supplier.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (returnRequest.status !== 'REQUESTED') {
      return NextResponse.json(
        { error: 'Return cannot be modified' },
        { status: 400 }
      );
    }

    if (approve) {
      // Approve return
      const updatedReturn = await prisma.return.update({
        where: { id: returnId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          reviewedByAdminId: isAdmin ? session.user.id : null
        }
      });

      return NextResponse.json({ return: updatedReturn });
    } else {
      // Reject return
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason required' },
          { status: 400 }
        );
      }

      const updatedReturn = await prisma.return.update({
        where: { id: returnId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          inspectionNotes: rejectionReason,
          reviewedByAdminId: isAdmin ? session.user.id : null
        }
      });

      return NextResponse.json({ return: updatedReturn });
    }
  } catch (error) {
    console.error('Approve return error:', error);
    return NextResponse.json(
      { error: 'Failed to process return' },
      { status: 500 }
    );
  }
}

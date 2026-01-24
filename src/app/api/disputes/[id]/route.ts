import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        filedByUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedByAdmin: { select: { id: true, email: true, name: true } },
        transaction: { 
          include: { 
            buyer: { select: { id: true, email: true, companyName: true, name: true } },
            supplier: true,
            escrow: true,
            requirement: { select: { id: true, title: true } },
          } 
        },
        messages: {
          include: { user: { select: { id: true, email: true, companyName: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Check authorization
    const isAdmin = session.user.role === 'ADMIN';
    const isParticipant = 
      dispute.filedByUserId === session.user.id ||
      dispute.transaction.buyerId === session.user.id;

    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, evidenceUrls } = await req.json();

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true }
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Check authorization
    const isAdmin = session.user.role === 'ADMIN';
    const isParticipant = 
      dispute.filedByUserId === session.user.id ||
      dispute.transaction.buyerId === session.user.id;

    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Only admin can change status
    if (status && !isAdmin) {
      return NextResponse.json({ error: 'Only admin can change status' }, { status: 403 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'UNDER_REVIEW') {
        updateData.reviewedByAdminId = session.user.id;
      }
    }

    if (evidenceUrls) {
      updateData.evidenceUrls = [...dispute.evidenceUrls, ...evidenceUrls];
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: updateData,
      include: {
        filedByUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedByAdmin: { select: { id: true, email: true, name: true } },
        transaction: { include: { buyer: true, supplier: true } }
      }
    });

    return NextResponse.json({
      success: true,
      dispute: updatedDispute
    });
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

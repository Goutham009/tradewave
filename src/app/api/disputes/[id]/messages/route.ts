import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { message, attachments } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { 
        transaction: { include: { buyer: true } },
        filedByUser: true,
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

    const newMessage = await prisma.disputeMessage.create({
      data: {
        disputeId: id,
        userId: session.user.id,
        message: message.trim(),
        attachments: attachments || [],
        isAdmin,
      },
      include: { user: { select: { id: true, email: true, companyName: true, name: true } } }
    });

    // Update dispute status if admin responds to pending dispute
    if (isAdmin && dispute.status === 'PENDING') {
      await prisma.dispute.update({
        where: { id },
        data: { 
          status: 'UNDER_REVIEW',
          reviewedByAdminId: session.user.id,
        }
      });
    }

    // Notify other participants
    const participantIds = new Set<string>();
    participantIds.add(dispute.filedByUserId);
    participantIds.add(dispute.transaction.buyerId);
    
    // Notify admins if message is from participant
    if (!isAdmin) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      admins.forEach(admin => participantIds.add(admin.id));
    }

    // Remove current user
    participantIds.delete(session.user.id);

    // Send notifications
    for (const userId of Array.from(participantIds)) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'DISPUTE_OPENED',
          title: 'New Dispute Message',
          message: `New message in dispute ${id.slice(0, 8)}...`,
          resourceType: 'dispute',
          resourceId: id,
        }
      });

      emitToUser(userId, 'disputeMessageAdded', {
        disputeId: id,
        message: newMessage
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const messages = await prisma.disputeMessage.findMany({
      where: { disputeId: id },
      include: { user: { select: { id: true, email: true, companyName: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { transactionId, reason, description, evidenceUrls, requestedResolution } = await req.json();

    if (!transactionId || !reason || !description || !requestedResolution) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate transaction exists and belongs to user
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { 
        buyer: true, 
        supplier: true,
        escrow: true,
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Validate user is part of transaction
    const isParticipant = transaction.buyerId === session.user.id || 
      (transaction.supplier as any)?.email === session.user.email;
    
    if (!isParticipant && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized for this transaction' }, { status: 403 });
    }

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { transactionId }
    });

    if (existingDispute) {
      return NextResponse.json({ error: 'Dispute already exists for this transaction' }, { status: 400 });
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        transactionId,
        filedByUserId: session.user.id,
        reason,
        description,
        evidenceUrls: evidenceUrls || [],
        requestedResolution,
        status: 'PENDING'
      },
      include: {
        filedByUser: { select: { id: true, email: true, companyName: true, name: true } },
        transaction: { 
          include: { 
            buyer: { select: { id: true, email: true, companyName: true, name: true } },
            supplier: true 
          } 
        }
      }
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'DISPUTE_OPEN' }
    });

    // Update escrow status if exists
    if (transaction.escrow) {
      await prisma.escrowTransaction.update({
        where: { id: transaction.escrow.id },
        data: { status: 'DISPUTED' }
      });
    }

    // Create status history
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId,
        oldStatus: transaction.status,
        newStatus: 'DISPUTE_OPEN',
        changedById: session.user.id,
        reason: `Dispute filed: ${reason}`,
      }
    });

    // Create notification for other party
    const otherUserId = transaction.buyerId === session.user.id 
      ? null // Supplier doesn't have userId in this schema
      : transaction.buyerId;

    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          type: 'DISPUTE_OPENED',
          title: 'Dispute Filed',
          message: `A dispute has been filed for transaction ${transactionId.slice(0, 8)}...`,
          resourceType: 'dispute',
          resourceId: dispute.id,
        }
      });

      // Socket notification
      emitToUser(otherUserId, 'disputeFiled', {
        transactionId,
        disputeId: dispute.id,
        reason,
        status: 'PENDING'
      });
    }

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'DISPUTE_OPENED',
          title: 'New Dispute Filed',
          message: `Dispute filed for transaction ${transactionId.slice(0, 8)}... - Reason: ${reason}`,
          resourceType: 'dispute',
          resourceId: dispute.id,
        }
      });

      emitToUser(admin.id, 'disputeFiled', {
        transactionId,
        disputeId: dispute.id,
        reason,
        status: 'PENDING',
        isAdmin: true
      });
    }

    return NextResponse.json({
      success: true,
      dispute
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isAdmin = session.user.role === 'ADMIN';

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (!isAdmin) {
      whereClause.OR = [
        { filedByUserId: session.user.id },
        { transaction: { buyerId: session.user.id } },
      ];
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where: whereClause,
        include: {
          filedByUser: { select: { id: true, email: true, companyName: true, name: true } },
          reviewedByAdmin: { select: { id: true, email: true, name: true } },
          transaction: {
            select: {
              id: true,
              buyerId: true,
              supplierId: true,
              status: true,
              amount: true,
              currency: true,
              createdAt: true,
              buyer: { select: { id: true, name: true, companyName: true } },
              supplier: { select: { id: true, name: true, companyName: true } },
            }
          },
          messages: {
            select: { id: true, userId: true, message: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 3
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dispute.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      disputes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    
    // Return empty disputes on any database error (demo mode fallback)
    return NextResponse.json({
      success: true,
      disputes: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },
      demo: true,
      message: 'Database unavailable - showing demo mode'
    });
  }
}

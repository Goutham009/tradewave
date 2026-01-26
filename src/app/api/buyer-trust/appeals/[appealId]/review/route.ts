import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { recalculateBuyerTrustScore } from '@/lib/trust-score/engine';

// POST /api/buyer-trust/appeals/[appealId]/review - Review appeal (Admin)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appealId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { appealId } = await params;
    const body = await req.json();
    const { appealType, status, adminDecision } = body;

    if (!appealType || !status || !adminDecision) {
      return NextResponse.json({ error: 'appealType, status, and adminDecision required' }, { status: 400 });
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'PARTIAL'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    let result;
    let buyerId: string;

    if (appealType === 'FLAG') {
      const appeal = await prisma.flagAppeal.findUnique({
        where: { id: appealId },
        include: { flag: { include: { trustScore: true } } }
      });

      if (!appeal) {
        return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
      }

      buyerId = appeal.buyerId;

      result = await prisma.flagAppeal.update({
        where: { id: appealId },
        data: {
          status,
          adminDecision,
          reviewedByAdminId: session.user.id,
          reviewedAt: new Date()
        }
      });

      // Update flag status if approved
      if (status === 'APPROVED') {
        await prisma.buyerRiskFlag.update({
          where: { id: appeal.flagId },
          data: { status: 'FALSE_POSITIVE', resolvedAt: new Date() }
        });
      } else if (status === 'PARTIAL') {
        await prisma.buyerRiskFlag.update({
          where: { id: appeal.flagId },
          data: { status: 'RESOLVED', resolvedAt: new Date() }
        });
      }

      // Recalculate score
      await recalculateBuyerTrustScore(buyerId);

    } else if (appealType === 'BLACKLIST') {
      const appeal = await prisma.blacklistAppeal.findUnique({
        where: { id: appealId },
        include: { blacklist: true }
      });

      if (!appeal) {
        return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
      }

      buyerId = appeal.buyerId;

      result = await prisma.blacklistAppeal.update({
        where: { id: appealId },
        data: {
          status,
          adminDecision,
          reviewedByAdminId: session.user.id,
          reviewedAt: new Date()
        }
      });

      // Update blacklist status if approved
      if (status === 'APPROVED') {
        await prisma.buyerBlacklist.update({
          where: { id: appeal.blacklistId },
          data: { status: 'REMOVED', unblacklistedAt: new Date() }
        });

        await prisma.blacklistLog.create({
          data: {
            blacklistId: appeal.blacklistId,
            action: 'APPEAL_APPROVED',
            details: adminDecision,
            performedByAdminId: session.user.id
          }
        });
      } else {
        await prisma.blacklistLog.create({
          data: {
            blacklistId: appeal.blacklistId,
            action: status === 'REJECTED' ? 'APPEAL_REJECTED' : 'APPEAL_PARTIAL',
            details: adminDecision,
            performedByAdminId: session.user.id
          }
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid appealType' }, { status: 400 });
    }

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: buyerId!,
        type: 'SYSTEM',
        title: `Appeal ${status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Partially Approved'}`,
        message: `Your ${appealType.toLowerCase()} appeal has been ${status.toLowerCase()}.`,
        resourceType: 'appeal',
        resourceId: appealId
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reviewing appeal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

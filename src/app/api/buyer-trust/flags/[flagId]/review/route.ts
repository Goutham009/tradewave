import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { recalculateBuyerTrustScore } from '@/lib/trust-score/engine';

// POST /api/buyer-trust/flags/[flagId]/review - Admin review flag
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ flagId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { flagId } = await params;
    const body = await req.json();
    const { status, reviewNotes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 });
    }

    const validStatuses = ['RESOLVED', 'FALSE_POSITIVE', 'UNDER_REVIEW'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const flag = await prisma.buyerRiskFlag.findUnique({
      where: { id: flagId },
      include: { trustScore: { select: { buyerId: true } } }
    });

    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    const updatedFlag = await prisma.buyerRiskFlag.update({
      where: { id: flagId },
      data: {
        status,
        reviewNotes,
        reviewedByAdminId: session.user.id,
        resolvedAt: status === 'RESOLVED' || status === 'FALSE_POSITIVE' ? new Date() : null
      }
    });

    // Recalculate score if flag resolved
    if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
      await recalculateBuyerTrustScore(flag.trustScore.buyerId);
    }

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: flag.trustScore.buyerId,
        type: 'SYSTEM',
        title: status === 'FALSE_POSITIVE' ? 'Risk Flag Dismissed' : 'Risk Flag Updated',
        message: `A risk flag on your account has been ${status.toLowerCase().replace('_', ' ')}.`,
        resourceType: 'flag',
        resourceId: flagId
      }
    });

    return NextResponse.json(updatedFlag);
  } catch (error) {
    console.error('Error reviewing flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

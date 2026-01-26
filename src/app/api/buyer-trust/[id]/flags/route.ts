import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { createRiskFlag } from '@/lib/trust-score/engine';

// GET /api/buyer-trust/[id]/flags - Get risk flags for buyer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: buyerId } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId },
      select: { id: true }
    });

    if (!trustScore) {
      return NextResponse.json({ flags: [] });
    }

    const whereClause: any = { trustScoreId: trustScore.id };
    if (status) {
      whereClause.status = status;
    }

    const flags = await prisma.buyerRiskFlag.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewedByAdmin: { select: { id: true, name: true } },
        appeal: { select: { id: true, status: true } }
      }
    });

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/buyer-trust/[id]/flags - Create risk flag (Admin/System)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { id: buyerId } = await params;
    const body = await req.json();
    const { flagType, severity, description, transactionId, disputeId, relatedData } = body;

    if (!flagType || !severity || !description) {
      return NextResponse.json({ error: 'flagType, severity, and description required' }, { status: 400 });
    }

    await createRiskFlag(buyerId, flagType, severity, description, {
      transactionId,
      disputeId,
      relatedData
    });

    return NextResponse.json({ success: true, message: 'Flag created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

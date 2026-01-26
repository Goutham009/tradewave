import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/[id]/summary - Quick trust summary
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

    const trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId },
      select: {
        overallScore: true,
        riskLevel: true,
        riskCategory: true,
        lastTransactionAt: true,
        lastFlagAt: true,
        scoreLastUpdatedAt: true,
        _count: {
          select: {
            flags: { where: { status: 'ACTIVE' } }
          }
        }
      }
    });

    // Check blacklist status
    const blacklist = await prisma.buyerBlacklist.findUnique({
      where: { buyerId },
      select: { status: true, reason: true, severity: true, expiresAt: true }
    });

    if (!trustScore) {
      return NextResponse.json({
        buyerId,
        overallScore: 50,
        riskLevel: 'MEDIUM',
        riskCategory: null,
        activeFlagCount: 0,
        lastActivity: null,
        isBlacklisted: !!blacklist && blacklist.status === 'ACTIVE',
        blacklist: blacklist?.status === 'ACTIVE' ? blacklist : null
      });
    }

    return NextResponse.json({
      buyerId,
      overallScore: trustScore.overallScore,
      riskLevel: trustScore.riskLevel,
      riskCategory: trustScore.riskCategory,
      activeFlagCount: trustScore._count.flags,
      lastActivity: trustScore.lastTransactionAt || trustScore.scoreLastUpdatedAt,
      lastFlagAt: trustScore.lastFlagAt,
      isBlacklisted: !!blacklist && blacklist.status === 'ACTIVE',
      blacklist: blacklist?.status === 'ACTIVE' ? blacklist : null
    });
  } catch (error) {
    console.error('Error fetching trust summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

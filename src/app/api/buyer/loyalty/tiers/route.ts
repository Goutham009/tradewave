import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/loyalty/tiers - Get all loyalty tiers
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { tierLevel: 'asc' }
    });

    // Add tier thresholds for display
    const tierThresholds: Record<string, number> = {
      'BRONZE': 0,
      'SILVER': 5000,
      'GOLD': 25000,
      'PLATINUM': 100000
    };

    const tiersWithThresholds = tiers.map(tier => ({
      ...tier,
      spendingThreshold: tierThresholds[tier.tierName] || 0
    }));

    return NextResponse.json({ tiers: tiersWithThresholds });
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty tiers' },
      { status: 500 }
    );
  }
}

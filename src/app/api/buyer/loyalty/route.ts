import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/loyalty - Get buyer's loyalty status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyerId = session.user.id;

    // Get or create loyalty status
    let loyaltyStatus = await prisma.buyerLoyaltyStatus.findUnique({
      where: { buyerId },
      include: {
        currentTier: true,
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!loyaltyStatus) {
      // Create initial loyalty status with Bronze tier
      const bronzeTier = await prisma.loyaltyTier.findFirst({
        where: { tierLevel: 1 }
      });

      loyaltyStatus = await prisma.buyerLoyaltyStatus.create({
        data: {
          buyerId,
          currentTierId: bronzeTier?.id || null
        },
        include: {
          currentTier: true,
          history: true
        }
      });
    }

    // Get all tiers for comparison
    const allTiers = await prisma.loyaltyTier.findMany({
      orderBy: { tierLevel: 'asc' }
    });

    // Calculate progress to next tier
    const currentTierLevel = loyaltyStatus.currentTier?.tierLevel || 0;
    const nextTier = allTiers.find(t => t.tierLevel > currentTierLevel);

    // Simple tier thresholds (can be customized)
    const tierThresholds: Record<number, number> = {
      1: 0,      // Bronze: $0
      2: 5000,   // Silver: $5,000
      3: 25000,  // Gold: $25,000
      4: 100000  // Platinum: $100,000
    };

    const currentSpent = Number(loyaltyStatus.totalAmountSpent);
    const nextTierThreshold = nextTier ? tierThresholds[nextTier.tierLevel] : null;
    const progressToNextTier = nextTierThreshold 
      ? Math.min((currentSpent / nextTierThreshold) * 100, 100)
      : 100;
    const amountToNextTier = nextTierThreshold 
      ? Math.max(nextTierThreshold - currentSpent, 0)
      : 0;

    return NextResponse.json({
      loyaltyStatus,
      allTiers,
      nextTier,
      progressToNextTier,
      amountToNextTier
    });
  } catch (error) {
    console.error('Error fetching loyalty status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty status' },
      { status: 500 }
    );
  }
}

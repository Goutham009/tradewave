import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const stats = await prisma.userRatingStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      return NextResponse.json({
        userId,
        averageRating: 0,
        totalReviews: 0,
        approvedReviews: 0,
        trustBadge: null,
        trustScore: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
        avgCommunicationRating: 0,
        avgReliabilityRating: 0
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

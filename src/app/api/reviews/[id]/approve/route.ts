import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: { reviewerUser: true, reviewedUser: true }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update review status
    const approvedReview = await prisma.review.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedByAdminId: session.user.id,
        approvedAt: new Date()
      },
      include: {
        reviewerUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedUser: { select: { id: true, email: true, companyName: true, name: true } }
      }
    });

    // Recalculate user rating stats
    const userReviews = await prisma.review.findMany({
      where: {
        reviewedUserId: review.reviewedUserId,
        status: 'APPROVED'
      }
    });

    const ratings = userReviews.map((r) => r.overallRating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const communicationRatings = userReviews.map((r) => r.communicationRating);
    const avgCommunication = communicationRatings.length > 0 
      ? communicationRatings.reduce((a, b) => a + b, 0) / communicationRatings.length 
      : 0;

    const reliabilityRatings = userReviews.map((r) => r.reliabilityRating);
    const avgReliability = reliabilityRatings.length > 0 
      ? reliabilityRatings.reduce((a, b) => a + b, 0) / reliabilityRatings.length 
      : 0;

    const ratingCounts = {
      fiveStarCount: userReviews.filter((r) => r.overallRating === 5).length,
      fourStarCount: userReviews.filter((r) => r.overallRating === 4).length,
      threeStarCount: userReviews.filter((r) => r.overallRating === 3).length,
      twoStarCount: userReviews.filter((r) => r.overallRating === 2).length,
      oneStarCount: userReviews.filter((r) => r.overallRating === 1).length
    };

    // Determine trust badge
    let trustBadge = null;
    if (avgRating >= 4.8) trustBadge = 'GOLD';
    else if (avgRating >= 4.5) trustBadge = 'SILVER';
    else if (avgRating >= 4.0) trustBadge = 'BRONZE';

    // Calculate trust score (0-100)
    const trustScore = Math.min(100, avgRating * 20);

    // Update rating stats
    await prisma.userRatingStats.upsert({
      where: { userId: review.reviewedUserId },
      create: {
        userId: review.reviewedUserId,
        averageRating: avgRating,
        totalReviews: userReviews.length,
        approvedReviews: userReviews.length,
        avgCommunicationRating: avgCommunication,
        avgReliabilityRating: avgReliability,
        trustScore,
        trustBadge,
        ...ratingCounts
      },
      update: {
        averageRating: avgRating,
        totalReviews: userReviews.length,
        approvedReviews: userReviews.length,
        avgCommunicationRating: avgCommunication,
        avgReliabilityRating: avgReliability,
        trustScore,
        trustBadge,
        ...ratingCounts
      }
    });

    // Notify reviewer
    emitToUser(review.reviewerUserId, 'reviewApproved', {
      reviewId: review.id,
      status: 'APPROVED'
    });

    // Create notification for reviewer
    await prisma.notification.create({
      data: {
        userId: review.reviewerUserId,
        type: 'REVIEW_APPROVED',
        title: 'Review Approved',
        message: `Your review for ${review.reviewedUser.companyName || review.reviewedUser.name} has been approved and is now visible.`,
        resourceType: 'review',
        resourceId: review.id,
      }
    });

    return NextResponse.json(approvedReview);
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

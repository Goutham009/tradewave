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
    const { moderationReason } = await req.json();

    const review = await prisma.review.findUnique({
      where: { id },
      include: { reviewerUser: true, reviewedUser: true }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const rejectedReview = await prisma.review.update({
      where: { id },
      data: {
        status: 'REJECTED',
        moderationReason,
        reviewedByAdminId: session.user.id
      },
      include: {
        reviewerUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedUser: { select: { id: true, email: true, companyName: true, name: true } }
      }
    });

    // Notify reviewer
    emitToUser(review.reviewerUserId, 'reviewRejected', {
      reviewId: review.id,
      status: 'REJECTED',
      reason: moderationReason
    });

    // Create notification for reviewer
    await prisma.notification.create({
      data: {
        userId: review.reviewerUserId,
        type: 'REVIEW_REJECTED',
        title: 'Review Not Approved',
        message: `Your review could not be published. Reason: ${moderationReason}`,
        resourceType: 'review',
        resourceId: review.id,
      }
    });

    return NextResponse.json(rejectedReview);
  } catch (error) {
    console.error('Error rejecting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

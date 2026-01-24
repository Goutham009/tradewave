import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { voteType } = await req.json();

    if (!['HELPFUL', 'NOT_HELPFUL'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId: session.user.id
        }
      }
    });

    if (existingVote) {
      // Update vote
      const updatedVote = await prisma.reviewVote.update({
        where: {
          reviewId_userId: {
            reviewId: id,
            userId: session.user.id
          }
        },
        data: { voteType }
      });

      // Recalculate counts
      const helpful = await prisma.reviewVote.count({
        where: { reviewId: id, voteType: 'HELPFUL' }
      });
      const notHelpful = await prisma.reviewVote.count({
        where: { reviewId: id, voteType: 'NOT_HELPFUL' }
      });

      await prisma.review.update({
        where: { id },
        data: {
          helpfulCount: helpful,
          notHelpfulCount: notHelpful
        }
      });

      return NextResponse.json({ success: true, vote: updatedVote });
    } else {
      // Create new vote
      const newVote = await prisma.reviewVote.create({
        data: {
          reviewId: id,
          userId: session.user.id,
          voteType
        }
      });

      // Update counts
      const helpful = await prisma.reviewVote.count({
        where: { reviewId: id, voteType: 'HELPFUL' }
      });
      const notHelpful = await prisma.reviewVote.count({
        where: { reviewId: id, voteType: 'NOT_HELPFUL' }
      });

      await prisma.review.update({
        where: { id },
        data: {
          helpfulCount: helpful,
          notHelpfulCount: notHelpful
        }
      });

      return NextResponse.json({ success: true, vote: newVote });
    }
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

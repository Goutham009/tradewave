import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/buyer/transactions/[id]/review - Buyer submits post-transaction review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      buyerId,
      overallRating,
      communicationRating,
      reliabilityRating,
      qualityRating,
      title,
      description,
      tags,
      wouldRecommend,
    } = body;

    if (!buyerId || !overallRating || !description) {
      return NextResponse.json(
        { error: 'buyerId, overallRating, and description are required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: { id: true, supplierId: true, buyerId: true, status: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { transactionId: params.id },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Review already submitted for this transaction' }, { status: 409 });
    }

    // Find supplier's user record (if exists) for reviewedUserId
    // For now, we use the buyer's own ID as reviewer and transaction data for the review
    const review = await prisma.review.create({
      data: {
        transactionId: params.id,
        reviewerUserId: buyerId,
        reviewedUserId: buyerId, // In a real setup, this would be the supplier's user ID
        reviewType: 'BUYER_REVIEW_SELLER',
        overallRating: parseInt(overallRating),
        communicationRating: communicationRating ? parseInt(communicationRating) : parseInt(overallRating),
        reliabilityRating: reliabilityRating ? parseInt(reliabilityRating) : parseInt(overallRating),
        title: title || null,
        description,
        tags: tags || [],
        status: 'PENDING', // Admin moderates before publishing
      },
    });

    // Update transaction to mark review submitted
    await prisma.transaction.update({
      where: { id: params.id },
      data: { status: 'COMPLETED' },
    });

    // TODO: Notify admin for review moderation
    // TODO: Send thank-you email to buyer
    // TODO: Update supplier's aggregate ratings

    return NextResponse.json({
      status: 'success',
      review: {
        id: review.id,
        overallRating: review.overallRating,
        status: review.status,
      },
      message: 'Thank you for your review! It will be published after moderation.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

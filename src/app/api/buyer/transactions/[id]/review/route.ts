import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/buyer/transactions/[id]/review - Buyer submits post-transaction review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      overallRating,
      communicationRating,
      reliabilityRating,
      qualityRating,
      title,
      description,
      tags,
      wouldRecommend,
    } = body;

    if (!overallRating || !description) {
      return NextResponse.json(
        { error: 'overallRating and description are required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      select: { id: true, supplierId: true, buyerId: true, status: true, supplier: { select: { email: true } } },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { transactionId: params.id },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Review already submitted for this transaction' }, { status: 409 });
    }

    const supplierUser = transaction.supplier?.email
      ? await prisma.user.findUnique({ where: { email: transaction.supplier.email }, select: { id: true } })
      : null;

    if (!supplierUser) {
      return NextResponse.json(
        { error: 'Supplier user account not linked. Unable to submit review at this time.' },
        { status: 422 }
      );
    }

    const review = await prisma.review.create({
      data: {
        transactionId: params.id,
        reviewerUserId: session.user.id,
        reviewedUserId: supplierUser.id,
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

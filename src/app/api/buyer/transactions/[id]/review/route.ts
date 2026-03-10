import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/services/notificationService';

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
      select: {
        id: true,
        supplierId: true,
        buyerId: true,
        status: true,
        deliveryConfirmedAt: true,
        supplier: { select: { email: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviewEligibleStatuses = new Set([
      'DELIVERY_CONFIRMED',
      'QUALITY_APPROVED',
      'FUNDS_RELEASED',
      'COMPLETED',
    ]);

    const isDeliveryConfirmed = Boolean(transaction.deliveryConfirmedAt) || reviewEligibleStatuses.has(transaction.status);

    if (!isDeliveryConfirmed) {
      return NextResponse.json(
        {
          error: `Review can be submitted only after delivery confirmation. Current status: ${transaction.status}`,
        },
        { status: 400 }
      );
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

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'REVIEW_SUBMITTED',
          title: 'Review Awaiting Moderation',
          message: `A new review has been submitted and is pending moderation. Review ID: ${review.id}.`,
          resourceType: 'review',
          resourceId: review.id,
          metadata: {
            transactionId: params.id,
            reviewerUserId: session.user.id,
            reviewedUserId: supplierUser.id,
          },
          sendEmail: true,
        })
      )
    );

    await createNotification({
      userId: session.user.id,
      type: 'REVIEW_SUBMITTED',
      title: 'Thanks for Your Review',
      message: 'Thank you for sharing your feedback. Your review has been submitted for moderation.',
      resourceType: 'review',
      resourceId: review.id,
      sendEmail: true,
    });

    const supplierReviews = await prisma.review.findMany({
      where: {
        reviewedUserId: supplierUser.id,
        status: {
          in: ['APPROVED', 'PENDING'],
        },
      },
      select: {
        overallRating: true,
        communicationRating: true,
        reliabilityRating: true,
        status: true,
      },
    });

    const totalReviews = supplierReviews.length;
    const approvedReviews = supplierReviews.filter((item) => item.status === 'APPROVED').length;

    const avgRating = totalReviews
      ? supplierReviews.reduce((sum, item) => sum + item.overallRating, 0) / totalReviews
      : 0;
    const avgCommunication = totalReviews
      ? supplierReviews.reduce((sum, item) => sum + item.communicationRating, 0) / totalReviews
      : 0;
    const avgReliability = totalReviews
      ? supplierReviews.reduce((sum, item) => sum + item.reliabilityRating, 0) / totalReviews
      : 0;

    const ratingCounts = {
      fiveStarCount: supplierReviews.filter((item) => item.overallRating === 5).length,
      fourStarCount: supplierReviews.filter((item) => item.overallRating === 4).length,
      threeStarCount: supplierReviews.filter((item) => item.overallRating === 3).length,
      twoStarCount: supplierReviews.filter((item) => item.overallRating === 2).length,
      oneStarCount: supplierReviews.filter((item) => item.overallRating === 1).length,
    };

    let trustBadge: 'GOLD' | 'SILVER' | 'BRONZE' | null = null;
    if (avgRating >= 4.8) trustBadge = 'GOLD';
    else if (avgRating >= 4.5) trustBadge = 'SILVER';
    else if (avgRating >= 4.0) trustBadge = 'BRONZE';

    await prisma.userRatingStats.upsert({
      where: { userId: supplierUser.id },
      create: {
        userId: supplierUser.id,
        averageRating: avgRating,
        totalReviews,
        approvedReviews,
        avgCommunicationRating: avgCommunication,
        avgReliabilityRating: avgReliability,
        trustScore: Math.min(100, avgRating * 20),
        trustBadge,
        ...ratingCounts,
      },
      update: {
        averageRating: avgRating,
        totalReviews,
        approvedReviews,
        avgCommunicationRating: avgCommunication,
        avgReliabilityRating: avgReliability,
        trustScore: Math.min(100, avgRating * 20),
        trustBadge,
        ...ratingCounts,
      },
    });

    await prisma.supplier.updateMany({
      where: { id: transaction.supplierId },
      data: {
        overallRating: avgRating,
        communicationRating: avgCommunication,
        deliveryRating: avgReliability,
        totalReviews,
      },
    });

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

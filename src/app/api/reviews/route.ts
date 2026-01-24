import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { emitToUser } from '@/lib/socket/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      transactionId,
      reviewedUserId,
      overallRating,
      communicationRating,
      reliabilityRating,
      categoryRating,
      title,
      description,
      tags,
      attachmentUrls
    } = await req.json();

    // Validate transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { buyer: true, supplier: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Determine review type
    let reviewType: string;
    let otherUserId: string;

    // Check if user is buyer or associated with the supplier
    const isBuyer = transaction.buyerId === session.user.id;
    const isSupplier = transaction.supplier?.email === session.user.email;

    if (isBuyer) {
      reviewType = 'BUYER_REVIEW_SELLER';
      otherUserId = transaction.supplierId;
    } else if (isSupplier) {
      reviewType = 'SELLER_REVIEW_BUYER';
      otherUserId = transaction.buyerId;
    } else {
      return NextResponse.json({ error: 'Not authorized for this transaction' }, { status: 403 });
    }

    // Verify reviewed user ID matches
    if (reviewedUserId !== otherUserId) {
      return NextResponse.json({ error: 'Invalid reviewed user' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { transactionId }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists for this transaction' }, { status: 400 });
    }

    // Validate ratings
    if (
      ![overallRating, communicationRating, reliabilityRating].every(
        (r) => r >= 1 && r <= 5
      )
    ) {
      return NextResponse.json({ error: 'Ratings must be between 1 and 5' }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        transactionId,
        reviewerUserId: session.user.id,
        reviewedUserId: otherUserId,
        reviewType,
        overallRating,
        communicationRating,
        reliabilityRating,
        categoryRating: categoryRating || null,
        title: title || null,
        description,
        tags: tags || [],
        attachmentUrls: attachmentUrls || [],
        status: 'PENDING'
      },
      include: {
        reviewerUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedUser: { select: { id: true, email: true, companyName: true, name: true } }
      }
    });

    // Notify reviewed user via Socket.io
    emitToUser(otherUserId, 'reviewSubmitted', {
      transactionId,
      reviewId: review.id,
      status: 'PENDING',
      reviewerName: review.reviewerUser.companyName || review.reviewerUser.name
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'REVIEW_SUBMITTED',
        title: 'New Review Submitted',
        message: `${review.reviewerUser.companyName || review.reviewerUser.name} submitted a ${overallRating}-star review for your transaction.`,
        resourceType: 'review',
        resourceId: review.id,
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const reviewType = searchParams.get('reviewType');
    const status = searchParams.get('status') || 'APPROVED';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isAdmin = session.user.role === 'ADMIN';

    let whereClause: any = {};

    if (userId) {
      whereClause.reviewedUserId = userId;
    }

    if (reviewType) {
      whereClause.reviewType = reviewType;
    }

    if (!isAdmin) {
      whereClause.status = 'APPROVED';
    } else if (status) {
      whereClause.status = status;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          reviewerUser: { select: { id: true, email: true, companyName: true, name: true } },
          reviewedUser: { select: { id: true, email: true, companyName: true, name: true } },
          reviewedByAdmin: { select: { id: true, email: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

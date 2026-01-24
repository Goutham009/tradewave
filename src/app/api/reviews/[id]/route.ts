import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewerUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedByAdmin: { select: { id: true, email: true, name: true } },
        votes: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check authorization
    const isAdmin = session.user.role === 'ADMIN';
    const isReviewer = review.reviewerUserId === session.user.id;
    const isReviewed = review.reviewedUserId === session.user.id;

    if (!isAdmin && !isReviewer && !isReviewed && review.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { overallRating, communicationRating, reliabilityRating, description, tags } = await req.json();

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Only reviewer can edit (and only if pending)
    if (review.reviewerUserId !== session.user.id || review.status !== 'PENDING') {
      return NextResponse.json({ error: 'Not authorized to edit' }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        overallRating: overallRating || review.overallRating,
        communicationRating: communicationRating || review.communicationRating,
        reliabilityRating: reliabilityRating || review.reliabilityRating,
        description: description || review.description,
        tags: tags || review.tags
      },
      include: {
        reviewerUser: { select: { id: true, email: true, companyName: true, name: true } },
        reviewedUser: { select: { id: true, email: true, companyName: true, name: true } }
      }
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

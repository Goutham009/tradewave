import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// POST /api/buyer/purchase-history/:id/rate - Rate a past purchase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, review } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if purchase exists and belongs to user
    const purchase = await prisma.purchaseHistory.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    if (purchase.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to rate this purchase' },
        { status: 403 }
      );
    }

    // Update purchase with rating
    const updatedPurchase = await prisma.purchaseHistory.update({
      where: { id },
      data: {
        rating,
        review: review || null,
        ratedAt: new Date()
      }
    });

    // Create notification for supplier
    await prisma.notification.create({
      data: {
        userId: purchase.supplierId,
        type: 'SYSTEM',
        title: 'New Purchase Rating',
        message: `A buyer rated their purchase of "${purchase.productName}" with ${rating} stars.`,
        resourceType: 'purchase_history',
        resourceId: id
      }
    });

    return NextResponse.json({
      success: true,
      purchase: updatedPurchase
    });
  } catch (error) {
    console.error('Error rating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to rate purchase' },
      { status: 500 }
    );
  }
}

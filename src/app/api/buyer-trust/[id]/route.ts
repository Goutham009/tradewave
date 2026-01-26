import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/[id] - Get buyer trust score
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: buyerId } = await params;

    // Check if requester has permission (admin, the buyer themselves, or a seller who transacted with them)
    const isAdmin = session.user.role === 'ADMIN';
    const isSelf = session.user.id === buyerId;
    
    let hasTransacted = false;
    if (!isAdmin && !isSelf) {
      const transaction = await prisma.transaction.findFirst({
        where: {
          buyerId,
          supplierId: session.user.id
        }
      });
      hasTransacted = !!transaction;
    }

    if (!isAdmin && !isSelf && !hasTransacted) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, companyName: true }
        },
        flags: {
          where: { status: { in: ['ACTIVE', 'UNDER_REVIEW'] } },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        scoreHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        sellerNotes: isAdmin ? {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { seller: { select: { id: true, name: true, companyName: true } } }
        } : session.user.id !== buyerId ? {
          where: { sellerId: session.user.id },
          orderBy: { createdAt: 'desc' }
        } : undefined
      }
    });

    if (!trustScore) {
      // Return default score if not calculated yet
      return NextResponse.json({
        buyerId,
        overallScore: 50,
        riskLevel: 'MEDIUM',
        paymentReliabilityScore: 50,
        disputeHistoryScore: 50,
        behavioralScore: 50,
        complianceScore: 50,
        communicationScore: 50,
        totalTransactions: 0,
        flags: [],
        scoreHistory: [],
        message: 'No trust score calculated yet'
      });
    }

    return NextResponse.json(trustScore);
  } catch (error) {
    console.error('Error fetching trust score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

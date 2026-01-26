import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/[id]/notes - Get seller's notes for this buyer
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

    const trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId },
      select: { id: true }
    });

    if (!trustScore) {
      return NextResponse.json({ notes: [] });
    }

    const notes = await prisma.sellerBuyerNote.findMany({
      where: {
        trustScoreId: trustScore.id,
        sellerId: session.user.id
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/buyer-trust/[id]/notes - Add note about buyer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: buyerId } = await params;
    const body = await req.json();
    const { note, isWarning, isPositive, transactionId, disputeId } = body;

    if (!note) {
      return NextResponse.json({ error: 'Note content required' }, { status: 400 });
    }

    // Get or create trust score
    let trustScore = await prisma.buyerTrustScore.findUnique({
      where: { buyerId }
    });

    if (!trustScore) {
      trustScore = await prisma.buyerTrustScore.create({
        data: { buyerId }
      });
    }

    const newNote = await prisma.sellerBuyerNote.create({
      data: {
        sellerId: session.user.id,
        trustScoreId: trustScore.id,
        note,
        isWarning: isWarning || false,
        isPositive: isPositive || false,
        transactionId,
        disputeId
      }
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

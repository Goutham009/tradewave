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
    const body = await req.json();
    const { messageType, message, proposedChanges } = body;

    if (!messageType || !message) {
      return NextResponse.json({ error: 'Message type and content required' }, { status: 400 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { rfq: { select: { buyerId: true, title: true } } }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const isSeller = quote.sellerId === session.user.id;
    const isBuyer = quote.rfq.buyerId === session.user.id;

    if (!isSeller && !isBuyer) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const negotiationMessage = await prisma.quoteNegotiationMessage.create({
      data: {
        quoteId: id,
        fromUserId: session.user.id,
        messageType,
        message,
        proposedChanges: proposedChanges ? JSON.stringify(proposedChanges) : null
      },
      include: {
        fromUser: { select: { id: true, name: true, companyName: true } }
      }
    });

    // Update quote status to UNDER_NEGOTIATION if it's SUBMITTED
    if (quote.status === 'SUBMITTED') {
      await prisma.quote.update({
        where: { id },
        data: { status: 'UNDER_NEGOTIATION', negotiationRound: { increment: 1 } }
      });
    }

    // Notify the other party
    const recipientId = isSeller ? quote.rfq.buyerId : quote.sellerId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'SYSTEM',
        title: 'New Negotiation Message',
        message: `New message on quote for "${quote.rfq.title}"`,
        resourceType: 'quote',
        resourceId: quote.id
      }
    });

    return NextResponse.json(negotiationMessage, { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { sellerId: true, rfq: { select: { buyerId: true } } }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const isSeller = quote.sellerId === session.user.id;
    const isBuyer = quote.rfq.buyerId === session.user.id;

    if (!isSeller && !isBuyer) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await prisma.quoteNegotiationMessage.findMany({
      where: { quoteId: id },
      include: { fromUser: { select: { id: true, name: true, companyName: true } } },
      orderBy: { createdAt: 'asc' }
    });

    // Mark unread messages as read
    await prisma.quoteNegotiationMessage.updateMany({
      where: {
        quoteId: id,
        readAt: null,
        fromUserId: { not: session.user.id }
      },
      data: { readAt: new Date() }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

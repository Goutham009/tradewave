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
    const body = await req.json().catch(() => ({}));

    const rfq = await prisma.requestForQuote.findUnique({
      where: { id },
      include: { quotes: { select: { sellerId: true } } }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updatedRFQ = await prisma.requestForQuote.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        selectedQuoteId: body.selectedQuoteId || null
      }
    });

    // Log
    await prisma.rFQLog.create({
      data: {
        rfqId: id,
        action: 'CLOSED',
        details: body.selectedQuoteId 
          ? `RFQ closed with selected quote: ${body.selectedQuoteId}`
          : 'RFQ closed without selecting a quote',
        performedByUserId: session.user.id
      }
    });

    // Notify all suppliers who submitted quotes
    const sellerIds = Array.from(new Set(rfq.quotes.map(q => q.sellerId)));
    for (const sellerId of sellerIds) {
      await prisma.notification.create({
        data: {
          userId: sellerId,
          type: 'SYSTEM',
          title: 'RFQ Closed',
          message: `The RFQ "${rfq.title}" has been closed.`,
          resourceType: 'rfq',
          resourceId: rfq.id
        }
      });
    }

    return NextResponse.json(updatedRFQ);
  } catch (error) {
    console.error('Error closing RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

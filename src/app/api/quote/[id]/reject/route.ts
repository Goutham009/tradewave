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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { rfq: { select: { buyerId: true, title: true } } }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only buyer can reject quotes' }, { status: 403 });
    }

    if (!['SUBMITTED', 'UNDER_NEGOTIATION'].includes(quote.status)) {
      return NextResponse.json({ error: 'Quote cannot be rejected in current status' }, { status: 400 });
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date()
      }
    });

    await prisma.quoteLog.create({
      data: {
        quoteId: id,
        action: 'REJECTED',
        details: body.reason || 'Quote rejected by buyer',
        performedByUserId: session.user.id
      }
    });

    await prisma.notification.create({
      data: {
        userId: quote.sellerId,
        type: 'SYSTEM',
        title: 'Quote Rejected',
        message: `Your quote for "${quote.rfq.title}" was not selected.${body.reason ? ` Reason: ${body.reason}` : ''}`,
        resourceType: 'quote',
        resourceId: quote.id
      }
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error rejecting quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

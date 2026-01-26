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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        rfq: true,
        seller: { select: { id: true, name: true, email: true, companyName: true } }
      }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Only buyer can accept
    if (quote.rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only buyer can accept quotes' }, { status: 403 });
    }

    // Check quote status
    if (!['SUBMITTED', 'UNDER_NEGOTIATION'].includes(quote.status)) {
      return NextResponse.json({ error: 'Quote cannot be accepted in current status' }, { status: 400 });
    }

    // Check expiry
    if (new Date(quote.validUntil) < new Date()) {
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 });
    }

    // Create transaction from quote
    const transaction = await prisma.transaction.create({
      data: {
        requirementId: quote.rfq.id, // Using RFQ as requirement
        quotationId: quote.rfq.id, // Placeholder - may need proper mapping
        buyerId: session.user.id,
        supplierId: quote.sellerId,
        amount: quote.totalPrice,
        currency: quote.currency,
        status: 'INITIATED',
        estimatedDelivery: quote.deliveryDate
      }
    });

    // Update quote
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        transactionId: transaction.id
      }
    });

    // Update RFQ
    await prisma.requestForQuote.update({
      where: { id: quote.rfqId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        selectedQuoteId: id
      }
    });

    // Log
    await prisma.quoteLog.create({
      data: {
        quoteId: id,
        action: 'ACCEPTED',
        details: `Quote accepted and converted to transaction ${transaction.id}`,
        performedByUserId: session.user.id
      }
    });

    await prisma.rFQLog.create({
      data: {
        rfqId: quote.rfqId,
        action: 'QUOTE_SELECTED',
        details: `Quote ${quote.quoteNumber} accepted`,
        performedByUserId: session.user.id
      }
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: quote.sellerId,
        type: 'QUOTATION_ACCEPTED',
        title: 'Quote Accepted!',
        message: `Your quote for "${quote.rfq.title}" has been accepted!`,
        resourceType: 'transaction',
        resourceId: transaction.id
      }
    });

    return NextResponse.json({
      quote: updatedQuote,
      transaction: { id: transaction.id }
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, email: true, companyName: true } },
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            description: true,
            requestedQuantity: true,
            quantityUnit: true,
            deliveryCity: true,
            deliveryCountry: true,
            deliveryDate: true,
            buyerId: true,
            buyerCompanyName: true
          }
        },
        quantityBreaks: { orderBy: { minQuantity: 'asc' } },
        attachments: true,
        messages: {
          include: { fromUser: { select: { id: true, name: true, companyName: true } } },
          orderBy: { createdAt: 'asc' }
        },
        logs: {
          include: { performedByUser: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        parentQuote: { select: { id: true, quoteNumber: true, version: true } },
        childQuotes: { select: { id: true, quoteNumber: true, version: true, status: true } }
      }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Check access - seller, buyer, or admin
    const isSeller = quote.sellerId === session.user.id;
    const isBuyer = quote.rfq.buyerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isSeller && !isBuyer && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
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
    const body = await req.json();

    const quote = await prisma.quote.findUnique({
      where: { id }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Only allow updates for SUBMITTED or UNDER_NEGOTIATION quotes
    if (!['SUBMITTED', 'UNDER_NEGOTIATION'].includes(quote.status)) {
      return NextResponse.json(
        { error: 'Cannot update quote in current status' },
        { status: 400 }
      );
    }

    // Store old values for logging
    const oldValues = {
      unitPrice: quote.unitPrice,
      totalPrice: quote.totalPrice,
      deliveryDate: quote.deliveryDate,
      paymentTerms: quote.paymentTerms
    };

    const updateData: any = { version: { increment: 1 } };

    const allowedFields = [
      'title', 'description', 'unitPrice', 'totalPrice', 'deliveryDate',
      'deliveryLocation', 'shippingCost', 'shippingMethod', 'incoterms',
      'paymentTerms', 'downPaymentRequired', 'downPaymentPercentage',
      'productionLeadTime', 'totalLeadTime', 'qualityAssurance',
      'certifications', 'guaranteeInMonths', 'validUntil', 'notes'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['deliveryDate', 'validUntil'].includes(field)) {
          updateData[field] = new Date(body[field]);
        } else if (['unitPrice', 'totalPrice', 'shippingCost', 'downPaymentRequired'].includes(field)) {
          updateData[field] = parseFloat(body[field]);
        } else if (['productionLeadTime', 'totalLeadTime', 'downPaymentPercentage', 'guaranteeInMonths'].includes(field)) {
          updateData[field] = parseInt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        seller: { select: { id: true, name: true, companyName: true } },
        quantityBreaks: true,
        rfq: { select: { title: true, buyerId: true } }
      }
    });

    // Log
    await prisma.quoteLog.create({
      data: {
        quoteId: id,
        action: 'UPDATED',
        details: `Quote updated (v${updatedQuote.version})`,
        performedByUserId: session.user.id,
        oldValues: JSON.stringify(oldValues),
        newValues: JSON.stringify(updateData)
      }
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: updatedQuote.rfq.buyerId,
        type: 'SYSTEM',
        title: 'Quote Updated',
        message: `${updatedQuote.sellerCompanyName} updated their quote for: ${updatedQuote.rfq.title}`,
        resourceType: 'quote',
        resourceId: quote.id
      }
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

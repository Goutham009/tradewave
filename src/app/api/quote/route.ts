import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

function generateQuoteNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QUOTE-${date}-${random}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      rfqId,
      title,
      description,
      unitPrice,
      totalPrice,
      currency,
      deliveryDate,
      deliveryLocation,
      shippingCost,
      shippingMethod,
      incoterms,
      paymentTerms,
      downPaymentRequired,
      downPaymentPercentage,
      paymentSchedule,
      productionLeadTime,
      totalLeadTime,
      qualityAssurance,
      certifications,
      guaranteeInMonths,
      validUntil,
      notes,
      quantityBreaks
    } = body;

    // Validation
    if (!rfqId || !title || !unitPrice || !totalPrice || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!deliveryDate || !paymentTerms || !productionLeadTime || !totalLeadTime) {
      return NextResponse.json({ error: 'Missing delivery or payment information' }, { status: 400 });
    }

    // Check RFQ exists and is open
    const rfq = await prisma.requestForQuote.findUnique({
      where: { id: rfqId }
    });

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    if (rfq.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'RFQ is not open for quotes' }, { status: 400 });
    }

    if (new Date(rfq.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'RFQ has expired' }, { status: 400 });
    }

    // Check if seller has access (for private RFQs)
    if (rfq.visibility === 'PRIVATE' && !rfq.selectedSuppliers.includes(session.user.id)) {
      return NextResponse.json({ error: 'Not invited to this RFQ' }, { status: 403 });
    }

    // Get seller details for snapshot
    const seller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, companyName: true }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Create quote with quantity breaks
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        rfqId,
        sellerId: session.user.id,
        sellerCompanyName: seller.companyName || seller.name,
        sellerContactName: seller.name,
        sellerContactEmail: seller.email,
        sellerContactPhone: seller.phone || '',
        title,
        description: description || null,
        unitPrice: parseFloat(unitPrice),
        totalPrice: parseFloat(totalPrice),
        currency,
        deliveryDate: new Date(deliveryDate),
        deliveryLocation: deliveryLocation || null,
        shippingCost: shippingCost ? parseFloat(shippingCost) : null,
        shippingMethod: shippingMethod || null,
        incoterms: incoterms || null,
        paymentTerms,
        downPaymentRequired: downPaymentRequired ? parseFloat(downPaymentRequired) : null,
        downPaymentPercentage: downPaymentPercentage ? parseInt(downPaymentPercentage) : null,
        paymentSchedule: paymentSchedule ? JSON.stringify(paymentSchedule) : null,
        productionLeadTime: parseInt(productionLeadTime),
        totalLeadTime: parseInt(totalLeadTime),
        qualityAssurance: qualityAssurance || null,
        certifications: certifications || [],
        guaranteeInMonths: guaranteeInMonths ? parseInt(guaranteeInMonths) : null,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        notes: notes || null,
        submittedAt: new Date(),
        quantityBreaks: quantityBreaks?.length > 0 ? {
          create: quantityBreaks.map((qb: any) => ({
            minQuantity: parseInt(qb.minQuantity),
            maxQuantity: qb.maxQuantity ? parseInt(qb.maxQuantity) : null,
            unitPrice: parseFloat(qb.unitPrice),
            discount: qb.discount ? parseFloat(qb.discount) : null
          }))
        } : undefined
      },
      include: {
        seller: { select: { id: true, name: true, companyName: true } },
        quantityBreaks: true,
        rfq: { select: { title: true, rfqNumber: true, buyerId: true } }
      }
    });

    // Update RFQ quote count
    await prisma.requestForQuote.update({
      where: { id: rfqId },
      data: { quotesReceived: { increment: 1 } }
    });

    // Log
    await prisma.quoteLog.create({
      data: {
        quoteId: quote.id,
        action: 'SUBMITTED',
        details: `Quote ${quote.quoteNumber} submitted for RFQ ${rfq.rfqNumber}`,
        performedByUserId: session.user.id
      }
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: rfq.buyerId,
        type: 'QUOTATION_RECEIVED',
        title: 'New Quote Received',
        message: `${seller.companyName || seller.name} submitted a quote for: ${rfq.title}`,
        resourceType: 'quote',
        resourceId: quote.id
      }
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {
      sellerId: session.user.id
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where: whereClause,
        include: {
          rfq: { select: { id: true, rfqNumber: true, title: true, buyerCompanyName: true } },
          quantityBreaks: true,
          _count: { select: { messages: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.quote.count({ where: whereClause })
    ]);

    // Get stats
    const stats = await prisma.quote.groupBy({
      by: ['status'],
      where: { sellerId: session.user.id },
      _count: true
    });

    return NextResponse.json({
      quotes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: stats.reduce((acc: any, s: any) => ({ ...acc, [s.status]: s._count }), {})
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

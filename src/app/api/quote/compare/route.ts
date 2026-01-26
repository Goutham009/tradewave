import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rfqId, quoteIds, comparisonName, comparisonCriteria, notes } = body;

    if (!rfqId || !quoteIds || quoteIds.length < 2) {
      return NextResponse.json({ error: 'Select at least 2 quotes to compare' }, { status: 400 });
    }

    // Verify RFQ ownership
    const rfq = await prisma.requestForQuote.findUnique({
      where: { id: rfqId }
    });

    if (!rfq || rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'RFQ not found or access denied' }, { status: 403 });
    }

    // Verify all quotes belong to this RFQ
    const quotes = await prisma.quote.findMany({
      where: { id: { in: quoteIds }, rfqId }
    });

    if (quotes.length !== quoteIds.length) {
      return NextResponse.json({ error: 'Some quotes not found' }, { status: 400 });
    }

    const comparison = await prisma.quoteComparison.create({
      data: {
        comparisonName: comparisonName || `Comparison - ${new Date().toLocaleDateString()}`,
        buyerId: session.user.id,
        rfqId,
        selectedQuotes: quoteIds,
        comparisonCriteria: comparisonCriteria ? JSON.stringify(comparisonCriteria) : null,
        notes: notes || null
      }
    });

    return NextResponse.json(comparison, { status: 201 });
  } catch (error) {
    console.error('Error creating comparison:', error);
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
    const rfqId = searchParams.get('rfqId');
    const quoteIds = searchParams.get('quoteIds')?.split(',');

    if (!rfqId || !quoteIds || quoteIds.length < 2) {
      return NextResponse.json({ error: 'Provide rfqId and at least 2 quoteIds' }, { status: 400 });
    }

    // Verify access
    const rfq = await prisma.requestForQuote.findUnique({
      where: { id: rfqId }
    });

    if (!rfq || rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get quotes with all details
    const quotes = await prisma.quote.findMany({
      where: { id: { in: quoteIds }, rfqId },
      include: {
        seller: { select: { id: true, name: true, companyName: true } },
        quantityBreaks: { orderBy: { minQuantity: 'asc' } }
      }
    });

    // Generate comparison data
    const comparison = {
      rfq: {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        title: rfq.title,
        requestedQuantity: rfq.requestedQuantity,
        quantityUnit: rfq.quantityUnit
      },
      quotes: quotes.map(q => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        seller: q.seller,
        sellerCompanyName: q.sellerCompanyName,
        unitPrice: q.unitPrice,
        totalPrice: q.totalPrice,
        currency: q.currency,
        deliveryDate: q.deliveryDate,
        shippingCost: q.shippingCost,
        shippingMethod: q.shippingMethod,
        incoterms: q.incoterms,
        paymentTerms: q.paymentTerms,
        downPaymentPercentage: q.downPaymentPercentage,
        productionLeadTime: q.productionLeadTime,
        totalLeadTime: q.totalLeadTime,
        certifications: q.certifications,
        guaranteeInMonths: q.guaranteeInMonths,
        validUntil: q.validUntil,
        quantityBreaks: q.quantityBreaks
      })),
      analysis: generateAnalysis(quotes, rfq.requestedQuantity)
    };

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error comparing quotes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateAnalysis(quotes: any[], requestedQuantity: number) {
  if (quotes.length === 0) return null;

  const prices = quotes.map(q => Number(q.totalPrice));
  const leadTimes = quotes.map(q => q.totalLeadTime);
  const warranties = quotes.map(q => q.guaranteeInMonths || 0);

  return {
    lowestPrice: {
      quoteId: quotes[prices.indexOf(Math.min(...prices))].id,
      value: Math.min(...prices)
    },
    highestPrice: {
      quoteId: quotes[prices.indexOf(Math.max(...prices))].id,
      value: Math.max(...prices)
    },
    fastestDelivery: {
      quoteId: quotes[leadTimes.indexOf(Math.min(...leadTimes))].id,
      value: Math.min(...leadTimes)
    },
    longestWarranty: {
      quoteId: quotes[warranties.indexOf(Math.max(...warranties))].id,
      value: Math.max(...warranties)
    },
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      difference: Math.max(...prices) - Math.min(...prices),
      percentDiff: ((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices) * 100).toFixed(1)
    }
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/quotations/[id]/review - Admin reviews quote, sets margin, makes visible to buyer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      action, // 'approve', 'reject', 'request_revision'
      marginType, // 'PERCENTAGE' or 'FIXED_AMOUNT'
      marginPercentage,
      marginAmount,
      ranking,
      adminNotes,
      adminReviewedBy,
    } = body;

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Calculate buyer-visible pricing with margin
      let buyerUnitPrice = Number(quotation.unitPrice);
      let calculatedMarginAmount = 0;

      if (marginType === 'PERCENTAGE' && marginPercentage) {
        calculatedMarginAmount = buyerUnitPrice * (marginPercentage / 100);
        buyerUnitPrice += calculatedMarginAmount;
      } else if (marginType === 'FIXED_AMOUNT' && marginAmount) {
        calculatedMarginAmount = marginAmount;
        buyerUnitPrice += calculatedMarginAmount;
      }

      const buyerTotal = buyerUnitPrice * quotation.quantity;
      const buyerSubtotal = buyerTotal;

      const updatedQuotation = await prisma.quotation.update({
        where: { id: params.id },
        data: {
          // Original supplier pricing preserved
          supplierPricePerUnit: quotation.unitPrice,
          supplierTotalAmount: quotation.total,
          // Margin
          marginType: marginType || null,
          marginPercentage: marginPercentage || null,
          marginAmount: calculatedMarginAmount || null,
          // Buyer-visible pricing
          unitPrice: buyerUnitPrice,
          subtotal: buyerSubtotal,
          total: buyerTotal + Number(quotation.shipping || 0) + Number(quotation.insurance || 0) + Number(quotation.customs || 0) + Number(quotation.taxes || 0),
          // Admin review
          status: 'APPROVED_BY_ADMIN',
          visibleToBuyer: true,
          adminReviewed: true,
          adminReviewedBy: adminReviewedBy || null,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
          ranking: ranking || null,
        },
      });

      // Update requirement to QUOTATIONS_READY if at least 1 quote visible
      const visibleQuotes = await prisma.quotation.count({
        where: {
          requirementId: quotation.requirementId,
          visibleToBuyer: true,
        },
      });

      if (visibleQuotes >= 1) {
        await prisma.requirement.update({
          where: { id: quotation.requirementId },
          data: { status: 'QUOTATIONS_READY' },
        });
      }

      // TODO: Notify buyer that quotes are ready
      // TODO: Notify AM that quotes are ready for buyer review

      return NextResponse.json({
        status: 'success',
        quotation: updatedQuotation,
        pricing: {
          supplierPrice: Number(quotation.unitPrice),
          margin: calculatedMarginAmount,
          marginType,
          buyerPrice: buyerUnitPrice,
          buyerTotal: buyerTotal,
        },
      });
    } else if (action === 'reject') {
      const updatedQuotation = await prisma.quotation.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          adminReviewed: true,
          adminReviewedBy: adminReviewedBy || null,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      return NextResponse.json({ status: 'success', quotation: updatedQuotation });
    } else if (action === 'request_revision') {
      const updatedQuotation = await prisma.quotation.update({
        where: { id: params.id },
        data: {
          status: 'UNDER_REVIEW',
          adminNotes: adminNotes || null,
        },
      });

      return NextResponse.json({ status: 'success', quotation: updatedQuotation });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error reviewing quotation:', error);
    return NextResponse.json({ error: 'Failed to review quotation' }, { status: 500 });
  }
}

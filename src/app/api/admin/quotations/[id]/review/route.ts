import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatQuotationReference, formatRequirementReference } from '@/lib/flow-references';

// POST /api/admin/quotations/[id]/review - Admin reviews quote, sets margin, makes visible to buyer
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      action, // 'approve', 'reject', 'request_revision'
      marginType, // 'PERCENTAGE' or 'FIXED_AMOUNT'
      marginPercentage,
      marginAmount,
      ranking,
      adminNotes,
    } = body;
    const adminReviewedBy = session.user.id;

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            buyerId: true,
            assignedAccountManagerId: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const quotationRef = formatQuotationReference(quotation.id);
    const requirementRef = formatRequirementReference(quotation.requirementId);

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
          adminReviewedBy,
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

      await prisma.notification.createMany({
        data: [
          {
            userId: quotation.requirement.buyerId,
            type: 'QUOTATION_RECEIVED',
            title: 'Quotation Approved by Admin',
            message: `${quotationRef} for ${requirementRef} is now visible for your review and negotiation.`,
            resourceType: 'quotation',
            resourceId: quotation.id,
          },
          ...(quotation.requirement.assignedAccountManagerId
            ? [
                {
                  userId: quotation.requirement.assignedAccountManagerId,
                  type: 'QUOTATION_RECEIVED' as const,
                  title: 'Client Quotations Ready',
                  message: `Client quotation ${quotationRef} is approved and visible for requirement ${requirementRef}.`,
                  resourceType: 'quotation',
                  resourceId: quotation.id,
                },
              ]
            : []),
          ...(quotation.userId
            ? [
                {
                  userId: quotation.userId,
                  type: 'QUOTATION_RECEIVED' as const,
                  title: 'Quotation Approved',
                  message: `${quotationRef} from ${quotation.supplier.companyName} was approved by admin and shared with buyer.`,
                  resourceType: 'quotation',
                  resourceId: quotation.id,
                },
              ]
            : []),
        ],
      });

      return NextResponse.json({
        status: 'success',
        quotation: updatedQuotation,
        references: {
          quotationId: quotation.id,
          quotationReference: quotationRef,
          requirementId: quotation.requirementId,
          requirementReference: requirementRef,
        },
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
          adminReviewedBy,
          adminReviewedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      });

      if (quotation.userId) {
        await prisma.notification.create({
          data: {
            userId: quotation.userId,
            type: 'QUOTATION_RECEIVED',
            title: 'Quotation Rejected by Admin',
            message: `${quotationRef} for ${requirementRef} was rejected.${adminNotes ? ` Notes: ${adminNotes}` : ''}`,
            resourceType: 'quotation',
            resourceId: quotation.id,
          },
        });
      }

      return NextResponse.json({
        status: 'success',
        quotation: updatedQuotation,
        references: {
          quotationId: quotation.id,
          quotationReference: quotationRef,
          requirementId: quotation.requirementId,
          requirementReference: requirementRef,
        },
      });
    } else if (action === 'request_revision') {
      const updatedQuotation = await prisma.quotation.update({
        where: { id: params.id },
        data: {
          status: 'UNDER_REVIEW',
          adminNotes: adminNotes || null,
        },
      });

      if (quotation.userId) {
        await prisma.notification.create({
          data: {
            userId: quotation.userId,
            type: 'QUOTATION_RECEIVED',
            title: 'Quotation Revision Requested',
            message: `Admin requested a revision for ${quotationRef}.${adminNotes ? ` Details: ${adminNotes}` : ''}`,
            resourceType: 'quotation',
            resourceId: quotation.id,
          },
        });
      }

      return NextResponse.json({
        status: 'success',
        quotation: updatedQuotation,
        references: {
          quotationId: quotation.id,
          quotationReference: quotationRef,
          requirementId: quotation.requirementId,
          requirementReference: requirementRef,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error reviewing quotation:', error);
    return NextResponse.json({ error: 'Failed to review quotation' }, { status: 500 });
  }
}

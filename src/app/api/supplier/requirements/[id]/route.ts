import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/supplier/requirements/[id] - Get requirement detail for supplier
// [id] is the SupplierRequirementCard ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card: any = await prisma.supplierRequirementCard.findUnique({
      where: { id: params.id },
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            subcategory: true,
            technicalSpecs: true,
            quantity: true,
            unit: true,
            budgetMin: true,
            budgetMax: true,
            currency: true,
            deliveryLocation: true,
            deliveryAddress: true,
            deliveryDeadline: true,
            incoterms: true,
            packagingRequirements: true,
            requiredCertifications: true,
            qualityInspectionRequired: true,
            paymentTerms: true,
            paymentMethod: true,
            specialInstructions: true,
            createdAt: true,
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Requirement card not found' }, { status: 404 });
    }

    // Mark as viewed if first time
    if (card.status === 'SENT') {
      await prisma.supplierRequirementCard.update({
        where: { id: params.id },
        data: { status: 'VIEWED', viewedAt: new Date() },
      });
    }

    const req_data = card.requirement;
    const visibleInfo = card.visibleInfo as any;
    const daysLeft = card.responseDeadline
      ? Math.max(0, Math.ceil((new Date(card.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    return NextResponse.json({
      cardId: card.id,
      requirementId: req_data.id,
      status: card.status === 'SENT' ? 'VIEWED' : card.status,
      sentAt: card.sentAt,
      viewedAt: card.viewedAt || new Date(),
      responseDeadline: card.responseDeadline,
      daysLeft,
      isExpired: card.responseDeadline ? new Date(card.responseDeadline) < new Date() : false,
      isDirect: visibleInfo?.isDirect || false,
      requirement: {
        title: req_data.title,
        description: req_data.description,
        category: req_data.category,
        subcategory: req_data.subcategory,
        technicalSpecs: req_data.technicalSpecs,
        quantity: req_data.quantity,
        unit: req_data.unit,
        budgetMin: req_data.budgetMin ? Number(req_data.budgetMin) : null,
        budgetMax: req_data.budgetMax ? Number(req_data.budgetMax) : null,
        budgetRange: req_data.budgetMin && req_data.budgetMax
          ? `$${Number(req_data.budgetMin).toLocaleString()} - $${Number(req_data.budgetMax).toLocaleString()} per ${req_data.unit}`
          : null,
        currency: req_data.currency,
        deliveryLocation: req_data.deliveryLocation,
        deliveryAddress: req_data.deliveryAddress,
        deliveryDeadline: req_data.deliveryDeadline,
        incoterms: req_data.incoterms,
        packagingRequirements: req_data.packagingRequirements,
        requiredCertifications: req_data.requiredCertifications,
        qualityInspectionRequired: req_data.qualityInspectionRequired,
        paymentTerms: req_data.paymentTerms,
        paymentMethod: req_data.paymentMethod,
        specialInstructions: req_data.specialInstructions,
        postedAt: req_data.createdAt,
      },
      matchInfo: visibleInfo?.matchScore ? {
        matchScore: visibleInfo.matchScore,
        matchReasons: visibleInfo.matchReasons || [],
      } : null,
      documents: visibleInfo?.documents || [],
    });
  } catch (error: any) {
    console.error('Error fetching requirement detail:', error);
    return NextResponse.json({ error: 'Failed to fetch requirement detail' }, { status: 500 });
  }
}

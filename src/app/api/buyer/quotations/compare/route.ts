import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/buyer/quotations/compare?requirementId=xxx - Get buyer-visible quotes for comparison
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requirementId = searchParams.get('requirementId');

    if (!requirementId) {
      return NextResponse.json({ error: 'requirementId is required' }, { status: 400 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      select: {
        id: true,
        title: true,
        category: true,
        quantity: true,
        unit: true,
        deliveryLocation: true,
        deliveryDeadline: true,
        currency: true,
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    const quotations = await prisma.quotation.findMany({
      where: {
        requirementId,
        visibleToBuyer: true,
        status: { in: ['APPROVED_BY_ADMIN', 'VISIBLE_TO_BUYER', 'IN_NEGOTIATION', 'ACCEPTED'] },
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            location: true,
            overallRating: true,
            totalReviews: true,
            verified: true,
          },
        },
      },
      orderBy: [{ ranking: 'asc' }, { total: 'asc' }],
    });

    // Return buyer-visible pricing only (no supplier original pricing)
    const buyerQuotations = quotations.map((q, index) => ({
      id: q.id,
      supplierId: q.supplierId,
      supplierName: q.supplier.companyName,
      supplierLocation: q.supplier.location,
      supplierRating: q.supplier.overallRating ? Number(q.supplier.overallRating) : null,
      supplierReviews: q.supplier.totalReviews,
      supplierVerified: q.supplier.verified,
      // Buyer-visible pricing
      unitPrice: Number(q.unitPrice),
      quantity: q.quantity,
      subtotal: Number(q.subtotal),
      shipping: q.shipping ? Number(q.shipping) : 0,
      insurance: q.insurance ? Number(q.insurance) : 0,
      customs: q.customs ? Number(q.customs) : 0,
      taxes: q.taxes ? Number(q.taxes) : 0,
      total: Number(q.total),
      currency: q.currency,
      // Terms
      leadTime: q.leadTime,
      deliveryTimeline: q.deliveryTimeline,
      warranty: q.warranty,
      paymentTerms: q.paymentTerms,
      terms: q.terms,
      certifications: q.certifications,
      samples: q.samples,
      sampleCost: q.sampleCost ? Number(q.sampleCost) : null,
      validUntil: q.validUntil,
      // Status
      status: q.status,
      ranking: q.ranking || index + 1,
      isRecommended: index === 0,
    }));

    return NextResponse.json({
      requirement,
      quotations: buyerQuotations,
      total: buyerQuotations.length,
    });
  } catch (error) {
    console.error('Error fetching quotations for comparison:', error);
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

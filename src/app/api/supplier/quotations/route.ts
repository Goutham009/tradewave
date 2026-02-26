import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatQuotationReference, formatRequirementReference } from '@/lib/flow-references';

// POST /api/supplier/quotations - Supplier submits a quote for a requirement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      supplierRequirementCardId,
      supplierId,
      userId,
      // Pricing
      pricePerUnit,
      quantity,
      currency,
      // Delivery
      productionLeadTime,
      shippingLeadTime,
      expectedDeliveryDate,
      incoterms,
      portOfLoading,
      // Payment
      paymentTerms,
      advancePercentage,
      paymentFlexible,
      // Quality
      certifications,
      qualityInspectionAccepted,
      inspectionAgency,
      warranty,
      // Samples
      samplesAvailable,
      sampleCost,
      sampleQuantity,
      sampleLeadTime,
      // Additional
      additionalTerms,
      specialOffers,
      notes,
      // Validity
      validUntil,
      // Documents (URLs)
      documents,
    } = body;

    if (!supplierRequirementCardId || !supplierId || !pricePerUnit || !quantity) {
      return NextResponse.json(
        { error: 'supplierRequirementCardId, supplierId, pricePerUnit, and quantity are required' },
        { status: 400 }
      );
    }

    // Fetch the requirement card
    const card: any = await prisma.supplierRequirementCard.findUnique({
      where: { id: supplierRequirementCardId },
      include: {
        requirement: {
          select: { id: true, title: true, unit: true, deliveryDeadline: true, assignedAccountManagerId: true },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Requirement card not found' }, { status: 404 });
    }

    if (card.supplierId !== supplierId) {
      return NextResponse.json({ error: 'This requirement was not sent to you' }, { status: 403 });
    }

    if (card.status === 'QUOTE_SUBMITTED') {
      return NextResponse.json({ error: 'You have already submitted a quote for this requirement' }, { status: 409 });
    }

    if (card.status === 'DECLINED') {
      return NextResponse.json({ error: 'You have declined this requirement' }, { status: 400 });
    }

    // Check deadline
    if (card.responseDeadline && new Date(card.responseDeadline) < new Date()) {
      return NextResponse.json({ error: 'Response deadline has passed' }, { status: 400 });
    }

    // Calculate totals
    const unitPriceNum = parseFloat(pricePerUnit);
    const quantityNum = parseInt(quantity);
    const subtotal = unitPriceNum * quantityNum;
    const total = subtotal; // Shipping, insurance, etc. will be added by admin if needed
    const totalDeliveryTimeline = (productionLeadTime || 0) + (shippingLeadTime || 0);

    // Calculate advance/balance amounts
    const advancePct = advancePercentage || 30;
    const advanceAmount = Math.round(total * (advancePct / 100) * 100) / 100;
    const balanceAmount = Math.round((total - advanceAmount) * 100) / 100;

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        requirementId: card.requirementId,
        supplierId,
        userId: userId || null,
        supplierRequirementCardId: card.id,
        // Supplier's pricing (before admin margin)
        supplierPricePerUnit: unitPriceNum,
        supplierTotalAmount: total,
        // These will be adjusted by admin when adding margin
        unitPrice: unitPriceNum,
        quantity: quantityNum,
        subtotal,
        total,
        currency: currency || 'USD',
        // Delivery
        leadTime: totalDeliveryTimeline,
        deliveryTimeline: totalDeliveryTimeline,
        deliveryTimelineUnit: 'DAYS',
        // Quality & terms
        certifications: certifications || [],
        samples: samplesAvailable || false,
        sampleCost: sampleCost ? parseFloat(sampleCost) : null,
        warranty: warranty || null,
        paymentTerms: paymentTerms || `${advancePct}% advance, ${100 - advancePct}% on delivery`,
        terms: additionalTerms || null,
        additionalTerms: specialOffers || null,
        notes: notes || null,
        // Valid until
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        // Status
        status: 'SUBMITTED',
        visibleToBuyer: false, // Admin must review first
        submittedAt: new Date(),
      } as any,
    });

    // Update SupplierRequirementCard
    await prisma.supplierRequirementCard.update({
      where: { id: supplierRequirementCardId },
      data: {
        status: 'QUOTE_SUBMITTED',
      },
    });

    // Update requirement quote count
    await prisma.requirement.update({
      where: { id: card.requirementId },
      data: {
        quotesReceived: { increment: 1 },
      },
    });

    const quotationRef = formatQuotationReference(quotation.id);
    const requirementRef = formatRequirementReference(card.requirementId);

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const amId = (card as any).requirement?.assignedAccountManagerId || null;

    const notifications = [
      ...admins.map((admin) => ({
        userId: admin.id,
        type: 'QUOTATION_RECEIVED' as const,
        title: 'New Supplier Quotation Submitted',
        message: `${quotationRef} was submitted for ${requirementRef} and awaits admin review.`,
        resourceType: 'quotation',
        resourceId: quotation.id,
      })),
      ...(amId
        ? [
            {
              userId: amId,
              type: 'QUOTATION_RECEIVED' as const,
              title: 'Quotation Submitted for Client Requirement',
              message: `A new quotation ${quotationRef} was received for ${requirementRef}.`,
              resourceType: 'quotation',
              resourceId: quotation.id,
            },
          ]
        : []),
      ...(userId
        ? [
            {
              userId,
              type: 'QUOTATION_RECEIVED' as const,
              title: 'Quotation Submitted Successfully',
              message: `Your quotation ${quotationRef} for ${requirementRef} was submitted and is pending admin review.`,
              resourceType: 'quotation',
              resourceId: quotation.id,
            },
          ]
        : []),
    ];

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      status: 'success',
      quotation: {
        id: quotation.id,
        referenceId: quotationRef,
        requirementId: card.requirementId,
        requirementReference: requirementRef,
        requirementTitle: card.requirement.title,
        status: 'SUBMITTED',
        pricePerUnit: unitPriceNum,
        total,
        currency: quotation.currency,
        deliveryTimeline: totalDeliveryTimeline,
        validUntil: quotation.validUntil,
        submittedAt: quotation.submittedAt,
      },
      message: 'Quote submitted successfully. Admin will review it before showing to buyer.',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to submit quotation', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/supplier/quotations - Get supplier's submitted quotations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!supplierId) {
      return NextResponse.json({ error: 'supplierId is required' }, { status: 400 });
    }

    const where: any = { supplierId };
    if (status) {
      where.status = status;
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          requirement: {
            select: {
              id: true,
              title: true,
              category: true,
              quantity: true,
              unit: true,
              deliveryLocation: true,
              deliveryDeadline: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    const formattedQuotations = quotations.map((q: any) => ({
      id: q.id,
      requirementId: q.requirementId,
      requirementTitle: q.requirement.title,
      category: q.requirement.category,
      status: q.status,
      // Supplier sees their own pricing
      pricePerUnit: Number(q.supplierPricePerUnit || q.unitPrice),
      total: Number(q.supplierTotalAmount || q.total),
      quantity: q.quantity,
      unit: q.requirement.unit,
      currency: q.currency,
      deliveryTimeline: q.deliveryTimeline || q.leadTime,
      validUntil: q.validUntil,
      submittedAt: q.submittedAt,
      createdAt: q.createdAt,
      // Status details
      visibleToBuyer: q.visibleToBuyer,
      adminReviewed: q.adminReviewed,
      adminReviewedAt: q.adminReviewedAt,
      acceptedAt: q.acceptedAt,
      rejectedAt: q.rejectedAt,
      // Negotiation
      isCounterOffer: q.isCounterOffer,
      revisionNumber: q.revisionNumber,
      negotiationThreadId: q.negotiationThreadId,
    }));

    // Count by status
    const statusCounts = await prisma.quotation.groupBy({
      by: ['status'],
      where: { supplierId },
      _count: { id: true },
    });

    const counts: Record<string, number> = {};
    statusCounts.forEach((sc: any) => {
      counts[sc.status] = sc._count.id;
    });

    return NextResponse.json({
      quotations: formattedQuotations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts,
    });
  } catch (error: any) {
    console.error('Error fetching supplier quotations:', error);
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

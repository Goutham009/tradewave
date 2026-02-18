import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/procurement/requirements/[id]/match-suppliers - Send requirement to matched suppliers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { supplierIds, sentBy, responseDeadlineDays } = body;

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json({ error: 'At least one supplier ID is required' }, { status: 400 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      include: { buyer: { select: { companyName: true, accountManagerId: true } } },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    const responseDeadline = new Date(Date.now() + (responseDeadlineDays || 3) * 24 * 60 * 60 * 1000);

    // Create SupplierRequirementCard for each supplier
    const cards = [];
    for (const supplierId of supplierIds) {
      try {
        const card = await prisma.supplierRequirementCard.create({
          data: {
            requirementId: params.id,
            supplierId,
            status: 'SENT',
            sentBy: sentBy || null,
            visibleInfo: {
              productName: requirement.title,
              productCategory: requirement.category,
              description: requirement.description,
              technicalSpecs: requirement.technicalSpecs,
              quantity: requirement.quantity,
              unit: requirement.unit,
              budgetRange: requirement.budgetMin && requirement.budgetMax
                ? `$${requirement.budgetMin} - $${requirement.budgetMax} per ${requirement.unit}`
                : null,
              deliveryLocation: requirement.deliveryLocation,
              requiredByDate: requirement.deliveryDeadline,
              incoterms: requirement.incoterms,
              requiredCertifications: requirement.requiredCertifications,
              qualityInspectionRequired: requirement.qualityInspectionRequired,
              paymentTerms: requirement.paymentTerms,
              specialInstructions: requirement.specialInstructions,
            },
            internalInfo: {
              buyerExpectedPrice: requirement.targetPrice ? Number(requirement.targetPrice) : null,
              buyerCompany: requirement.buyer?.companyName,
              accountManager: requirement.assignedAccountManagerId,
              procurementOfficer: sentBy,
            },
            responseDeadline,
          },
        });
        cards.push(card);
      } catch (e: any) {
        // Skip if already exists (unique constraint)
        if (e.code !== 'P2002') throw e;
      }
    }

    // Update requirement status
    await prisma.requirement.update({
      where: { id: params.id },
      data: {
        status: 'QUOTES_PENDING',
        suppliersSent: cards.length,
        suppliersSentAt: new Date(),
        quoteDeadline: responseDeadline,
      },
    });

    // Update procurement task if exists
    await prisma.procurementTask.updateMany({
      where: { requirementId: params.id, status: 'ASSIGNED' },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        suppliersMatched: cards.length,
        notes: `Matched and sent to ${cards.length} suppliers`,
      },
    });

    // TODO: Send email notifications to all matched suppliers
    // TODO: Notify supplier AMs to follow up

    return NextResponse.json({
      status: 'success',
      cardsSent: cards.length,
      responseDeadline,
      cards: cards.map(c => ({ id: c.id, supplierId: c.supplierId, status: c.status })),
    });
  } catch (error) {
    console.error('Error matching suppliers:', error);
    return NextResponse.json({ error: 'Failed to match suppliers' }, { status: 500 });
  }
}

// GET /api/procurement/requirements/[id]/match-suppliers - Get auto-matched suppliers
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Find matching suppliers based on category, location, certifications
    const suppliers = await prisma.supplier.findMany({
      where: {
        verified: true,
        categories: { hasSome: [requirement.category] },
      },
      include: {
        loyaltyTier: { select: { currentTier: true } },
        certifications: { select: { name: true, verified: true } },
      },
      take: requirement.maxSuppliersToMatch || 15,
      orderBy: { overallRating: 'desc' },
    });

    // Calculate match score for each supplier
    const matchedSuppliers = suppliers.map(supplier => {
      let matchScore = 50; // Base score

      // Tier bonus
      const tier = supplier.loyaltyTier?.currentTier || 'STANDARD';
      if (tier === 'TRUSTED') matchScore += 30;
      else if (tier === 'STANDARD') matchScore += 15;

      // Rating bonus
      if (supplier.overallRating) matchScore += Number(supplier.overallRating) * 4;

      // Years in business bonus
      if (supplier.yearsInBusiness && supplier.yearsInBusiness >= 5) matchScore += 10;

      // Cap at 100
      matchScore = Math.min(matchScore, 100);

      return {
        id: supplier.id,
        name: supplier.name,
        companyName: supplier.companyName,
        location: supplier.location,
        categories: supplier.categories,
        tier,
        rating: supplier.overallRating ? Number(supplier.overallRating) : null,
        totalReviews: supplier.totalReviews,
        yearsInBusiness: supplier.yearsInBusiness,
        certifications: supplier.certifications.filter(c => c.verified).map(c => c.name),
        matchScore,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      requirement: {
        id: requirement.id,
        title: requirement.title,
        category: requirement.category,
        preferredTiers: requirement.preferredSupplierTiers,
        preferredGeographies: requirement.preferredGeographies,
      },
      suppliers: matchedSuppliers,
      total: matchedSuppliers.length,
    });
  } catch (error) {
    console.error('Error fetching matched suppliers:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

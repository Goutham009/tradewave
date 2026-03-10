import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatRequirementReference } from '@/lib/flow-references';

// POST /api/procurement/requirements/[id]/match-suppliers - Send requirement to matched suppliers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { supplierIds, responseDeadlineDays } = body;
    const sentBy = session.user.id;

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json({ error: 'At least one supplier ID is required' }, { status: 400 });
    }

    const requirement = await prisma.requirement.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        technicalSpecs: true,
        quantity: true,
        unit: true,
        budgetMin: true,
        budgetMax: true,
        targetPrice: true,
        currency: true,
        deliveryLocation: true,
        deliveryDeadline: true,
        incoterms: true,
        requiredCertifications: true,
        qualityInspectionRequired: true,
        paymentTerms: true,
        specialInstructions: true,
        preferredSupplierTiers: true,
        preferredGeographies: true,
        buyerId: true,
        assignedAccountManagerId: true,
      },
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    const requirementRef = formatRequirementReference(requirement.id);
    const responseDeadline = new Date(Date.now() + (responseDeadlineDays || 3) * 24 * 60 * 60 * 1000);

    const supplierProfiles = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true, email: true, companyName: true },
    });

    const supplierEmails = supplierProfiles.map((supplier) => supplier.email).filter(Boolean);
    const supplierUsers = supplierEmails.length
      ? await prisma.user.findMany({
          where: {
            role: 'SUPPLIER',
            email: { in: supplierEmails },
          },
          select: { id: true, email: true, kybStatus: true },
        })
      : [];

    const supplierUserByEmail = new Map(
      supplierUsers.map((user) => [user.email, user])
    );

    const eligibleSupplierIds = supplierProfiles
      .filter((supplier) => {
        const supplierUser = supplierUserByEmail.get(supplier.email || '');
        return supplierUser?.kybStatus === 'COMPLETED';
      })
      .map((supplier) => supplier.id);

    const skippedSuppliers = supplierProfiles
      .filter((supplier) => !eligibleSupplierIds.includes(supplier.id))
      .map((supplier) => ({
        supplierId: supplier.id,
        companyName: supplier.companyName,
      }));

    if (eligibleSupplierIds.length === 0) {
      return NextResponse.json(
        {
          error: 'No KYB-approved suppliers selected',
          suppliersSkippedDueToKyb: skippedSuppliers.length,
          skippedSuppliers,
          message:
            'All selected suppliers are missing approved supplier user accounts or KYB completion. Select KYB-approved suppliers and retry.',
        },
        { status: 400 }
      );
    }

    // Create SupplierRequirementCard for each supplier
    const cards = [];
    for (const supplierId of eligibleSupplierIds) {
      try {
        const card = await prisma.supplierRequirementCard.create({
          data: {
            requirementId: params.id,
            supplierId,
            status: 'SENT',
            sentBy,
            visibleInfo: {
              requirementReference: requirementRef,
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
              anonymized: true,
              visibility: 'PROCUREMENT_AND_ADMIN_ONLY',
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

    if (cards.length === 0) {
      return NextResponse.json(
        {
          error: 'No new supplier invitations were created',
          message:
            'Selected suppliers were already invited previously. Choose different suppliers or update the existing invitation flow.',
          suppliersSkippedDueToKyb: skippedSuppliers.length,
          skippedSuppliers,
        },
        { status: 409 }
      );
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

    // Notify buyer and AM that sourcing has started
    await prisma.notification.createMany({
      data: [
        {
          userId: requirement.buyerId,
          type: 'REQUIREMENT_CREATED',
          title: 'Requirement Sent to Suppliers',
          message: `${requirementRef} has been sent to ${cards.length} matched supplier${cards.length === 1 ? '' : 's'} for quotations.`,
          resourceType: 'requirement',
          resourceId: requirement.id,
        },
        ...(requirement.assignedAccountManagerId
          ? [
              {
                userId: requirement.assignedAccountManagerId,
                type: 'REQUIREMENT_CREATED' as const,
                title: 'Client Requirement in Sourcing',
                message: `${requirementRef} was dispatched to ${cards.length} suppliers by procurement.`,
                resourceType: 'requirement',
                resourceId: requirement.id,
              },
            ]
          : []),
      ],
    });

    const eligibleSupplierUsers = supplierUsers.filter(
      (user) => user.kybStatus === 'COMPLETED'
    );

    if (eligibleSupplierUsers.length > 0) {
      const supplierCompanyByEmail = new Map(
        supplierProfiles.map((supplier) => [supplier.email, supplier.companyName])
      );

      await prisma.notification.createMany({
        data: eligibleSupplierUsers.map((user) => ({
          userId: user.id,
          type: 'REQUIREMENT_CREATED',
          title: 'New Requirement to Quote',
          message: `You have received ${requirementRef} for quotation submission${supplierCompanyByEmail.get(user.email || '') ? ` via ${supplierCompanyByEmail.get(user.email || '')}` : ''}.`,
          resourceType: 'requirement',
          resourceId: requirement.id,
        })),
      });
    }

    return NextResponse.json({
      status: 'success',
      requirementReference: requirementRef,
      cardsSent: cards.length,
      suppliersSkippedDueToKyb: skippedSuppliers.length,
      skippedSuppliers,
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['PROCUREMENT_OFFICER', 'PROCUREMENT_TEAM', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    const supplierEmails = suppliers
      .map((supplier) => supplier.email)
      .filter((email): email is string => Boolean(email));

    const supplierUsers = supplierEmails.length
      ? await prisma.user.findMany({
          where: {
            role: 'SUPPLIER',
            email: { in: supplierEmails },
          },
          select: {
            id: true,
            email: true,
            kybStatus: true,
          },
        })
      : [];

    const supplierUserByEmail = new Map(supplierUsers.map((user) => [user.email, user]));

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

      const linkedSupplierUser = supplier.email
        ? supplierUserByEmail.get(supplier.email)
        : null;
      const supplierKybStatus = linkedSupplierUser?.kybStatus || 'PENDING';

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
        supplierUserId: linkedSupplierUser?.id || null,
        supplierUserKybStatus: supplierKybStatus,
        canInvite: supplierKybStatus === 'COMPLETED',
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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatRequirementReference } from '@/lib/flow-references';

// POST /api/am/requirements - AM creates requirement on behalf of buyer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ACCOUNT_MANAGER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      buyerId,
      // Product details
      title,
      description,
      category,
      subcategory,
      technicalSpecs,
      quantity,
      unit,
      // Pricing
      targetPrice,
      budgetMin,
      budgetMax,
      currency,
      // Quality
      requiredCertifications,
      qualityInspectionRequired,
      // Delivery
      deliveryLocation,
      deliveryAddress,
      deliveryDeadline,
      incoterms,
      packagingRequirements,
      // Payment
      paymentTerms,
      paymentMethod,
      // Matching preferences
      preferredSupplierTiers,
      preferredGeographies,
      maxSuppliersToMatch,
      communicationPreference,
      // Documents & notes
      specialInstructions,
      internalNotes,
    } = body;

    const createdByUserId = session.user.id;

    if (!buyerId || !title || !description || !category || !quantity || !unit || !deliveryLocation || !deliveryDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields: buyerId, title, description, category, quantity, unit, deliveryLocation, deliveryDeadline' },
        { status: 400 }
      );
    }

    // Verify buyer exists
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Calculate total budget
    const totalBudgetMin = budgetMin && quantity ? budgetMin * quantity : null;
    const totalBudgetMax = budgetMax && quantity ? budgetMax * quantity : null;

    const requirement = await prisma.requirement.create({
      data: {
        buyerId,
        title,
        description,
        category,
        subcategory: subcategory || null,
        technicalSpecs: technicalSpecs || null,
        quantity: parseInt(quantity),
        unit,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        totalBudgetMin: totalBudgetMin ? parseFloat(String(totalBudgetMin)) : null,
        totalBudgetMax: totalBudgetMax ? parseFloat(String(totalBudgetMax)) : null,
        currency: currency || 'USD',
        deliveryLocation,
        deliveryAddress: deliveryAddress || null,
        deliveryDeadline: new Date(deliveryDeadline),
        incoterms: incoterms || null,
        packagingRequirements: packagingRequirements || null,
        requiredCertifications: requiredCertifications || [],
        qualityInspectionRequired: qualityInspectionRequired || false,
        paymentTerms: paymentTerms || null,
        paymentMethod: paymentMethod || 'ESCROW',
        specialInstructions: specialInstructions || null,
        preferredSupplierTiers: preferredSupplierTiers || ['TRUSTED', 'STANDARD'],
        preferredGeographies: preferredGeographies || [],
        maxSuppliersToMatch: maxSuppliersToMatch || 10,
        communicationPreference: communicationPreference || 'THROUGH_AM',
        createdByUserId,
        createdByRole: 'ACCOUNT_MANAGER',
        assignedAccountManagerId: createdByUserId,
        internalNotes: internalNotes || null,
        status: 'PENDING_ADMIN_REVIEW',
        amVerified: true,
        amVerifiedAt: new Date(),
      },
    });
    const requirementRef = formatRequirementReference(requirement.id);

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const notifications = [
      {
        userId: buyerId,
        type: 'REQUIREMENT_CREATED' as const,
        title: 'Requirement Submitted by Account Manager',
        message: `Your Account Manager submitted ${requirementRef} for admin review.`,
        resourceType: 'requirement',
        resourceId: requirement.id,
      },
      ...admins.map((admin) => ({
        userId: admin.id,
        type: 'REQUIREMENT_CREATED' as const,
        title: 'AM Requirement Awaiting Admin Review',
        message: `${requirementRef} was created by AM and is ready for admin review.`,
        resourceType: 'requirement',
        resourceId: requirement.id,
      })),
    ];

    await prisma.notification.createMany({
      data: notifications,
    });

    return NextResponse.json({
      status: 'success',
      requirement: {
        id: requirement.id,
        referenceId: requirementRef,
        title: requirement.title,
        status: requirement.status,
        buyerId: requirement.buyerId,
        category: requirement.category,
        quantity: requirement.quantity,
        unit: requirement.unit,
        deliveryLocation: requirement.deliveryLocation,
        deliveryDeadline: requirement.deliveryDeadline,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
}

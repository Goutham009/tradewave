import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/am/requirements - AM creates requirement on behalf of buyer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      buyerId,
      createdByUserId,
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
        createdByUserId: createdByUserId || null,
        createdByRole: 'ACCOUNT_MANAGER',
        assignedAccountManagerId: createdByUserId || null,
        internalNotes: internalNotes || null,
        status: 'PENDING_ADMIN_REVIEW',
        amVerified: true,
        amVerifiedAt: new Date(),
      },
    });

    // TODO: Send notification email to buyer
    // TODO: Send notification to admin dashboard

    return NextResponse.json({
      status: 'success',
      requirement: {
        id: requirement.id,
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

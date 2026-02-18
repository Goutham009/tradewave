import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/buyer/requirements - Buyer creates a new requirement directly
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Step 1: Basic Information
      title,
      category,
      subcategory,
      description,
      technicalSpecs,
      specifications,
      // Step 2: Quantity & Budget
      quantity,
      unit,
      budgetMin,
      budgetMax,
      currency,
      // Step 3: Delivery
      deliveryLocation,
      deliveryAddress,
      deliveryDeadline,
      incoterms,
      packagingRequirements,
      // Step 4: Quality & Compliance
      requiredCertifications,
      qualityInspectionRequired,
      // Step 5: Payment & Preferences
      paymentTerms,
      paymentMethod,
      specialInstructions,
      preferredSupplierTiers,
      preferredGeographies,
      communicationPreference,
      priority,
    } = body;

    // Validate required fields
    if (!title || !category || !description || !quantity || !unit || !deliveryLocation || !deliveryDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, description, quantity, unit, deliveryLocation, deliveryDeadline' },
        { status: 400 }
      );
    }

    // Fetch buyer context
    const buyer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        companyName: true,
        accountManagerId: true,
        totalOrderCount: true,
        goodStanding: true,
      } as any,
    });

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const totalOrders = await prisma.transaction.count({
      where: { buyerId: session.user.id },
    });

    // Calculate total budget if per-unit budget given
    const totalBudgetMin = budgetMin && quantity ? Number(budgetMin) * quantity : null;
    const totalBudgetMax = budgetMax && quantity ? Number(budgetMax) * quantity : null;

    const requirement = await prisma.requirement.create({
      data: {
        buyerId: session.user.id,
        title,
        description,
        category,
        subcategory: subcategory || null,
        specifications: specifications || {},
        technicalSpecs: technicalSpecs || null,
        quantity,
        unit,
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        totalBudgetMin: totalBudgetMin || null,
        totalBudgetMax: totalBudgetMax || null,
        currency: currency || 'USD',
        deliveryLocation,
        deliveryAddress: deliveryAddress || null,
        deliveryDeadline: new Date(deliveryDeadline),
        incoterms: incoterms || null,
        packagingRequirements: packagingRequirements || null,
        requiredCertifications: requiredCertifications || [],
        qualityInspectionRequired: qualityInspectionRequired || false,
        paymentTerms: paymentTerms || null,
        paymentMethod: paymentMethod || null,
        specialInstructions: specialInstructions || null,
        preferredSupplierTiers: preferredSupplierTiers || [],
        preferredGeographies: preferredGeographies || [],
        communicationPreference: communicationPreference || 'THROUGH_AM',
        // Buyer context
        isReorder: false,
        buyerIsExisting: totalOrders > 0,
        buyerTotalOrders: totalOrders,
        buyerGoodStanding: (buyer as any).goodStanding ?? true,
        // Tracking
        createdByUserId: session.user.id,
        createdByRole: 'BUYER',
        assignedAccountManagerId: (buyer as any).accountManagerId || null,
        // Status
        status: 'PENDING_AM_VERIFICATION',
        priority: priority || 'MEDIUM',
      } as any,
    });

    // Send notification to Account Manager
    if ((buyer as any).accountManagerId) {
      await prisma.notification.create({
        data: {
          userId: (buyer as any).accountManagerId,
          type: 'REQUIREMENT_CREATED',
          title: 'New Requirement for Verification',
          message: `${buyer.companyName || buyer.name} submitted a new requirement: "${requirement.title}". Please review and verify.`,
          resourceType: 'requirement',
          resourceId: requirement.id,
        },
      });
    }

    // Notify admins if no AM assigned
    if (!(buyer as any).accountManagerId) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'REQUIREMENT_CREATED',
            title: 'New Requirement - No AM Assigned',
            message: `${buyer.companyName || buyer.name} submitted a new requirement: "${requirement.title}". No Account Manager is assigned.`,
            resourceType: 'requirement',
            resourceId: requirement.id,
          },
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      requirement: {
        id: requirement.id,
        title: requirement.title,
        category: requirement.category,
        quantity: requirement.quantity,
        unit: requirement.unit,
        status: requirement.status,
        isExistingBuyer: totalOrders > 0,
        totalOrders,
      },
      message: 'Requirement created. Your Account Manager will verify the details.',
    });
  } catch (error: any) {
    console.error('Buyer requirement creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create requirement', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/buyer/requirements - List buyer's own requirements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { buyerId: session.user.id };
    if (status) where.status = status;

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          quotations: {
            select: { id: true, status: true },
          },
          _count: {
            select: { quotations: true, transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.requirement.count({ where }),
    ]);

    return NextResponse.json({
      requirements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Failed to list buyer requirements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

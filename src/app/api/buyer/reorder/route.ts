import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST /api/buyer/reorder - Create a reorder requirement from a previous transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      transactionId,
      deliveryDate,
      deliveryLocation,
      sameLocation = true,
      sendDirectToSupplier = true,
      modifiedQuantity,
      modifiedSpecs,
    } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
    }

    // Fetch the original transaction with full details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        quotation: {
          include: {
            requirement: true,
            supplier: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            accountManagerId: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Verify the buyer owns this transaction
    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const origReq = transaction.quotation?.requirement;
    if (!origReq) {
      return NextResponse.json({ error: 'Original requirement not found' }, { status: 404 });
    }

    const origQuotation = transaction.quotation;
    const supplier = origQuotation?.supplier;

    // Count buyer's total orders for context
    const totalOrders = await prisma.transaction.count({
      where: { buyerId: session.user.id },
    });

    // Create the reorder requirement (auto-populated from previous)
    const requirement = await prisma.requirement.create({
      data: {
        buyerId: session.user.id,
        title: origReq.title,
        description: origReq.description,
        category: origReq.category,
        subcategory: origReq.subcategory,
        specifications: origReq.specifications || {},
        technicalSpecs: origReq.technicalSpecs,
        quantity: modifiedQuantity || origReq.quantity,
        unit: origReq.unit,
        targetPrice: origReq.targetPrice,
        budgetMin: origReq.budgetMin,
        budgetMax: origReq.budgetMax,
        totalBudgetMin: origReq.totalBudgetMin,
        totalBudgetMax: origReq.totalBudgetMax,
        currency: origReq.currency,
        deliveryLocation: sameLocation
          ? origReq.deliveryLocation
          : (deliveryLocation || origReq.deliveryLocation),
        deliveryAddress: sameLocation
          ? origReq.deliveryAddress
          : deliveryLocation,
        deliveryDeadline: deliveryDate
          ? new Date(deliveryDate)
          : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Default 60 days
        incoterms: origReq.incoterms,
        packagingRequirements: origReq.packagingRequirements,
        requiredCertifications: origReq.requiredCertifications,
        qualityInspectionRequired: origReq.qualityInspectionRequired,
        paymentTerms: origReq.paymentTerms,
        paymentMethod: origReq.paymentMethod,
        specialInstructions: modifiedSpecs || origReq.specialInstructions,
        preferredSupplierTiers: origReq.preferredSupplierTiers,
        preferredGeographies: origReq.preferredGeographies,
        maxSuppliersToMatch: origReq.maxSuppliersToMatch,
        communicationPreference: origReq.communicationPreference,
        // Reorder metadata
        isReorder: true,
        originalRequirementId: origReq.id,
        originalTransactionId: transactionId,
        preferredSupplierId: supplier?.id || null,
        // Buyer context
        buyerIsExisting: true,
        buyerTotalOrders: totalOrders,
        buyerGoodStanding: true,
        // Tracking
        createdByUserId: session.user.id,
        createdByRole: 'BUYER',
        assignedAccountManagerId: (transaction.buyer as any)?.accountManagerId || null,
        // Status
        status: 'PENDING_AM_VERIFICATION',
        priority: 'MEDIUM',
      } as any,
    });

    // Send notification to Account Manager
    const accountManagerId = (transaction.buyer as any)?.accountManagerId;
    if (accountManagerId) {
      await prisma.notification.create({
        data: {
          userId: accountManagerId,
          type: 'REQUIREMENT_CREATED',
          title: 'Reorder Requirement Created',
          message: `${transaction.buyer?.name || 'A buyer'} from ${transaction.buyer?.companyName || 'their company'} has created a reorder for "${origReq.title}". Please verify the details.`,
          resourceType: 'requirement',
          resourceId: requirement.id,
        },
      });
    }

    // Notify admins if no AM assigned
    if (!accountManagerId) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'REQUIREMENT_CREATED',
            title: 'Reorder Requirement (No AM)',
            message: `Reorder created by ${transaction.buyer?.name || 'a buyer'} for "${origReq.title}" but no Account Manager is assigned.`,
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
        status: requirement.status,
        isReorder: true,
        originalTransactionId: transactionId,
        preferredSupplier: supplier
          ? { id: supplier.id, name: supplier.name, companyName: supplier.companyName }
          : null,
        sendDirectToSupplier,
      },
      message: 'Reorder created. Your Account Manager will verify the details shortly.',
    });
  } catch (error: any) {
    console.error('Reorder creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create reorder', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import { formatQuotationReference, formatRequirementReference } from '@/lib/flow-references';

// Standard response helpers
function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number, details?: any) {
  return NextResponse.json({ status: 'error', error: message, details }, { status });
}

// Check and update expired quotations
async function updateExpiredQuotations() {
  await prisma.quotation.updateMany({
    where: {
      validUntil: { lt: new Date() },
      status: { in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'] },
    },
    data: { status: 'EXPIRED' },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    // Update expired quotations before fetching
    await updateExpiredQuotations();

    const { searchParams } = new URL(request.url);
    const requirementId = searchParams.get('requirementId');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const where: any = {};

    // Role-based filtering
    if (session.user.role === 'BUYER') {
      where.requirement = { buyerId: session.user.id };
      where.visibleToBuyer = true;
    } else if (session.user.role === 'SUPPLIER') {
      // Suppliers see quotations they submitted
      where.userId = session.user.id;
    }

    if (requirementId) {
      where.requirementId = requirementId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status && status !== 'all') {
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    // Build orderBy
    const orderBy: any = {};
    if (['total', 'unitPrice', 'leadTime', 'createdAt', 'validUntil'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
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
              targetPrice: true,
              buyerId: true,
              buyer: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                },
              },
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              location: true,
              verified: true,
              overallRating: true,
              totalReviews: true,
              qualityRating: true,
              deliveryRating: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    // Add computed fields
    const quotationsWithMeta = quotations.map((q) => ({
      ...q,
      isExpired: q.validUntil < new Date(),
      daysUntilExpiry: Math.ceil((q.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      pricePerUnit: Number(q.unitPrice),
      savingsPercent: q.requirement.targetPrice 
        ? Math.round((1 - Number(q.unitPrice) / Number(q.requirement.targetPrice)) * 100)
        : null,
    }));

    return successResponse({
      quotations: quotationsWithMeta,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch quotations:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    // Suppliers and Admins can create quotations
    if (session.user.role !== 'SUPPLIER' && session.user.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only suppliers can submit quotations', 403);
    }

    const body = await request.json();
    const {
      requirementId,
      supplierId,
      unitPrice,
      quantity,
      currency = 'USD',
      leadTime,
      validDays = 14, // Default 14 days validity
      validUntil,
      shipping,
      insurance,
      customs,
      taxes,
      platformFee,
      notes,
      terms,
      certifications = [],
      samples = false,
      sampleCost,
    } = body;

    // Validation
    const errors: string[] = [];
    if (!requirementId) errors.push('requirementId is required');
    if (!supplierId) errors.push('supplierId is required');
    if (!unitPrice || unitPrice <= 0) errors.push('unitPrice must be positive');
    if (!quantity || quantity <= 0) errors.push('quantity must be positive');
    if (!leadTime || leadTime <= 0) errors.push('leadTime (days) is required');

    if (errors.length > 0) {
      return errorResponse('Validation failed', 400, { errors });
    }

    // Verify requirement exists and is open for quotations
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
    });

    if (!requirement) {
      return errorResponse('Requirement not found', 404);
    }

    if (!['SUBMITTED', 'SOURCING', 'QUOTES_PENDING', 'QUOTATIONS_READY', 'NEGOTIATING'].includes(requirement.status)) {
      return errorResponse('Requirement is not accepting quotations', 400);
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return errorResponse('Supplier not found', 404);
    }

    // Check for duplicate quotation
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        requirementId,
        supplierId,
        status: { in: ['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'] },
      },
    });

    if (existingQuotation) {
      return errorResponse('A quotation from this supplier already exists for this requirement', 409);
    }

    // Calculate totals
    const subtotal = unitPrice * quantity;
    const shippingCost = shipping || 0;
    const insuranceCost = insurance || 0;
    const customsCost = customs || 0;
    const taxesCost = taxes || 0;
    const fee = platformFee || subtotal * 0.02; // 2% platform fee
    const total = subtotal + shippingCost + insuranceCost + customsCost + taxesCost + fee;

    // Calculate valid until date
    const expiryDate = validUntil 
      ? new Date(validUntil) 
      : new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        requirementId,
        supplierId,
        userId: session.user.id,
        unitPrice,
        quantity,
        subtotal,
        shipping: shippingCost,
        insurance: insuranceCost,
        customs: customsCost,
        taxes: taxesCost,
        platformFee: fee,
        total,
        currency,
        leadTime,
        validUntil: expiryDate,
        notes,
        terms,
        certifications,
        samples,
        sampleCost: samples ? sampleCost : null,
        status: 'SUBMITTED',
      },
      include: {
        requirement: {
          select: { id: true, title: true, category: true, buyerId: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true, verified: true },
        },
      },
    });

    // Update requirement status if first quotation
    const quotationCount = await prisma.quotation.count({
      where: { requirementId },
    });

    if (quotationCount === 1) {
      await prisma.requirement.update({
        where: { id: requirementId },
        data: { status: 'QUOTES_PENDING' },
      });
    }

    const quotationRef = formatQuotationReference(quotation.id);
    const requirementRef = formatRequirementReference(requirement.id);

    // Notify admins and AM for quotation review (before buyer visibility)
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const notifications = [
        ...admins.map((admin) => ({
          userId: admin.id,
          type: 'QUOTATION_RECEIVED' as const,
          title: 'Quotation Submitted for Review',
          message: `${quotationRef} for ${requirementRef} was submitted by ${supplier.companyName} and is awaiting admin review.`,
          resourceType: 'quotation',
          resourceId: quotation.id,
        })),
        ...((requirement as any).assignedAccountManagerId
          ? [
              {
                userId: (requirement as any).assignedAccountManagerId,
                type: 'QUOTATION_RECEIVED' as const,
                title: 'Client Requirement Received Quotation',
                message: `${quotationRef} was submitted for ${requirementRef}. Buyer will see it after admin review.`,
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
    } catch (e) {
      // Non-critical
    }

    // Log activity
    try {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          type: 'QUOTATION',
          action: 'CREATE',
          description: `Submitted quotation for ${requirement.title}`,
          resourceType: 'quotation',
          resourceId: quotation.id,
        },
      });
    } catch (e) {
      // Non-critical
    }

    return successResponse({
      quotation,
      references: {
        quotationReference: quotationRef,
        requirementReference: requirementRef,
      },
      expiresIn: validDays,
      expiresAt: expiryDate,
    }, 201);
  } catch (error) {
    console.error('Failed to create quotation:', error);
    return errorResponse('Internal server error', 500);
  }
}

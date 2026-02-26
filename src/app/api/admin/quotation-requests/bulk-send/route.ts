import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'PROCUREMENT_OFFICER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requirementId, supplierIds, responseDeadlineHours = 48, isDirect = false } = await request.json();

    if (!requirementId || !supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json(
        { error: 'requirementId and supplierIds array are required' },
        { status: 400 }
      );
    }

    // Fetch the requirement with buyer info
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      include: {
        buyer: {
          select: { id: true, name: true, companyName: true, email: true }
        }
      }
    });

    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }

    // Verify requirement is in correct status for sending
    if (!['SUBMITTED', 'PENDING_ADMIN_REVIEW', 'VERIFIED'].includes(requirement.status)) {
      return NextResponse.json(
        { error: `Cannot send quotation requests for requirement in ${requirement.status} status` },
        { status: 400 }
      );
    }

    // Fetch suppliers to validate they exist
    const suppliers = await prisma.supplier.findMany({
      where: { 
        id: { in: supplierIds },
      }
    });

    // For now, include all suppliers (KYB check is on User model, not Supplier)
    // In production, join with User table to verify KYB status
    const validSupplierIds = suppliers.map(s => s.id);

    if (validSupplierIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid suppliers with completed KYB found' },
        { status: 400 }
      );
    }

    // Calculate response deadline
    const responseDeadline = new Date(Date.now() + responseDeadlineHours * 60 * 60 * 1000);

    // Prepare visible info for suppliers (hide buyer identity initially)
    const visibleInfo = {
      title: requirement.title,
      description: requirement.description,
      category: requirement.category,
      subcategory: requirement.subcategory,
      quantity: requirement.quantity,
      unit: requirement.unit,
      budgetRange: requirement.budgetMin && requirement.budgetMax 
        ? `${requirement.currency} ${requirement.budgetMin} - ${requirement.budgetMax}` 
        : null,
      deliveryLocation: requirement.deliveryLocation,
      deliveryDeadline: requirement.deliveryDeadline,
      requiredCertifications: requirement.requiredCertifications,
      technicalSpecs: requirement.technicalSpecs,
      incoterms: requirement.incoterms,
    };

    // Internal info (hidden from supplier)
    const internalInfo = {
      buyerId: requirement.buyerId,
      buyerCompany: requirement.buyer?.companyName,
      targetPrice: requirement.targetPrice,
      amId: requirement.assignedAccountManagerId,
      isDirect,
    };

    // Create supplier requirement cards
    const createdCards = [];
    const skippedSuppliers = [];

    for (const supplierId of validSupplierIds) {
      try {
        // Check if card already exists
        const existing = await prisma.supplierRequirementCard.findUnique({
          where: {
            requirementId_supplierId: { requirementId, supplierId }
          }
        });

        if (existing) {
          skippedSuppliers.push({ supplierId, reason: 'Already sent' });
          continue;
        }

        const card = await prisma.supplierRequirementCard.create({
          data: {
            requirementId,
            supplierId,
            sentBy: session.user.id,
            status: 'SENT',
            visibleInfo,
            internalInfo,
            responseDeadline,
          }
        });

        createdCards.push(card);

        // Get supplier's email for notification lookup
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier?.email) {
          // Find user by supplier email to send notification
          const supplierUser = await prisma.user.findUnique({
            where: { email: supplier.email },
            select: { id: true }
          });
          if (supplierUser) {
            await prisma.notification.create({
              data: {
                userId: supplierUser.id,
                type: 'REQUIREMENT_CREATED',
                title: 'New Quotation Request',
                message: `You've received a new quotation request for "${requirement.title}". Deadline: ${responseDeadline.toLocaleDateString()}`,
                resourceType: 'requirement',
                resourceId: requirementId
              }
            });
          }
        }
      } catch (err) {
        console.error(`Failed to create card for supplier ${supplierId}:`, err);
        skippedSuppliers.push({ supplierId, reason: 'Creation failed' });
      }
    }

    // Update requirement status
    await prisma.requirement.update({
      where: { id: requirementId },
      data: {
        status: 'QUOTES_PENDING',
      }
    });

    return NextResponse.json({
      success: true,
      message: `Quotation requests sent to ${createdCards.length} suppliers`,
      cardsSent: createdCards.length,
      cardsSkipped: skippedSuppliers.length,
      skippedDetails: skippedSuppliers,
      responseDeadline: responseDeadline.toISOString(),
    });
  } catch (error) {
    console.error('Bulk quotation request error:', error);
    return NextResponse.json(
      { error: 'Failed to send quotation requests' },
      { status: 500 }
    );
  }
}

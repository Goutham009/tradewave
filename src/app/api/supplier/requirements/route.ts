import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET /api/supplier/requirements - Get matched requirements for a supplier
// Returns SupplierRequirementCards with requirement details
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supplierEmail = session.user.email;
    if (!supplierEmail) {
      return NextResponse.json({ error: 'Supplier account email is missing' }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { email: supplierEmail },
      select: { id: true },
    });

    if (!supplier) {
      return NextResponse.json({
        requirements: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        counts: { new: 0, viewed: 0, quoted: 0 },
        supplierAccountRequired: true,
      });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // SENT, VIEWED, QUOTE_SUBMITTED, DECLINED
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // KYB check: user cannot receive requirements until KYB is completed
    // The API returns an empty list (not an error) so the UI just shows "no requirements yet"
    const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: { kybStatus: true },
    });

    if (!user || user.kybStatus !== 'COMPLETED') {
      return NextResponse.json({
        requirements: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        counts: { new: 0, viewed: 0, quoted: 0 },
        kybRequired: true,
      });
    }

    // Build filter
    const where: any = { supplierId: supplier.id };
    if (status) {
      where.status = status;
    } else {
      // By default show non-expired, non-declined cards
      where.status = { in: ['SENT', 'VIEWED', 'QUOTE_SUBMITTED'] };
    }

    const [cards, total] = await Promise.all([
      prisma.supplierRequirementCard.findMany({
        where,
        include: {
          requirement: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              subcategory: true,
              quantity: true,
              unit: true,
              budgetMin: true,
              budgetMax: true,
              currency: true,
              deliveryLocation: true,
              deliveryDeadline: true,
              incoterms: true,
              requiredCertifications: true,
              qualityInspectionRequired: true,
              paymentTerms: true,
              specialInstructions: true,
              createdAt: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // SENT first
          { sentAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierRequirementCard.count({ where }),
    ]);

    // Format response
    const requirements = cards.map((card: any) => {
      const req = card.requirement;
      const visibleInfo = card.visibleInfo as any;
      const daysLeft = card.responseDeadline
        ? Math.max(0, Math.ceil((new Date(card.responseDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

      return {
        cardId: card.id,
        requirementId: req.id,
        status: card.status,
        sentAt: card.sentAt,
        viewedAt: card.viewedAt,
        responseDeadline: card.responseDeadline,
        daysLeft,
        isExpired: card.responseDeadline ? new Date(card.responseDeadline) < new Date() : false,
        isDirect: visibleInfo?.isDirect || false,
        // Requirement details (visible to supplier)
        requirement: {
          title: req.title,
          description: req.description,
          category: req.category,
          subcategory: req.subcategory,
          quantity: req.quantity,
          unit: req.unit,
          budgetRange: req.budgetMin && req.budgetMax
            ? `$${Number(req.budgetMin).toLocaleString()} - $${Number(req.budgetMax).toLocaleString()} per ${req.unit}`
            : null,
          budgetMin: req.budgetMin ? Number(req.budgetMin) : null,
          budgetMax: req.budgetMax ? Number(req.budgetMax) : null,
          currency: req.currency,
          deliveryLocation: req.deliveryLocation,
          deliveryDeadline: req.deliveryDeadline,
          incoterms: req.incoterms,
          requiredCertifications: req.requiredCertifications,
          qualityInspectionRequired: req.qualityInspectionRequired,
          paymentTerms: req.paymentTerms,
          specialInstructions: req.specialInstructions,
          postedAt: req.createdAt,
        },
        // Extra visible info from the card (match analysis, etc.)
        matchInfo: visibleInfo?.matchScore ? {
          matchScore: visibleInfo.matchScore,
          matchReasons: visibleInfo.matchReasons || [],
        } : null,
      };
    });

    return NextResponse.json({
      requirements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        new: cards.filter((c: any) => c.status === 'SENT').length,
        viewed: cards.filter((c: any) => c.status === 'VIEWED').length,
        quoted: cards.filter((c: any) => c.status === 'QUOTE_SUBMITTED').length,
      },
      supplierId: supplier.id,
    });
  } catch (error: any) {
    console.error('Error fetching supplier requirements:', error);
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

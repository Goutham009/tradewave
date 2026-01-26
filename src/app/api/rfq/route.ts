import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

function generateRFQNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RFQ-${date}-${random}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      specifications,
      requestedQuantity,
      quantityUnit,
      deliveryLocation,
      deliveryCity,
      deliveryRegion,
      deliveryCountry,
      deliveryDate,
      industryCategory,
      productCategory,
      incoterms,
      qualityStandards,
      certificationRequired,
      productionCapacityNeeded,
      visibility,
      selectedSuppliers,
      expiresAt,
      estimatedBudget,
      budgetRange,
      publish
    } = body;

    // Validation
    if (!title || !description || !requestedQuantity || !quantityUnit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!deliveryCity || !deliveryCountry || !deliveryDate) {
      return NextResponse.json({ error: 'Missing delivery information' }, { status: 400 });
    }

    if (!industryCategory || !productCategory) {
      return NextResponse.json({ error: 'Missing category information' }, { status: 400 });
    }

    // Get user details for snapshot
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, companyName: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create RFQ
    const rfq = await prisma.requestForQuote.create({
      data: {
        rfqNumber: generateRFQNumber(),
        buyerId: session.user.id,
        buyerCompanyName: user.companyName || user.name,
        buyerContactName: user.name,
        buyerContactEmail: user.email,
        buyerContactPhone: user.phone || '',
        title,
        description,
        specifications: specifications || '{}',
        requestedQuantity: parseInt(requestedQuantity),
        quantityUnit,
        deliveryLocation: deliveryLocation || '',
        deliveryCity,
        deliveryRegion: deliveryRegion || '',
        deliveryCountry: deliveryCountry.toUpperCase(),
        deliveryDate: new Date(deliveryDate),
        industryCategory,
        productCategory,
        incoterms: incoterms || null,
        qualityStandards: qualityStandards || [],
        certificationRequired: certificationRequired || [],
        productionCapacityNeeded: productionCapacityNeeded ? parseInt(productionCapacityNeeded) : null,
        visibility: visibility || 'PRIVATE',
        selectedSuppliers: selectedSuppliers || [],
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedBudget: estimatedBudget || null,
        budgetRange: budgetRange ? JSON.stringify(budgetRange) : null,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish ? new Date() : null
      },
      include: {
        buyer: { select: { id: true, name: true, email: true, companyName: true } },
        attachments: true,
        quotes: true
      }
    });

    // Create log
    await prisma.rFQLog.create({
      data: {
        rfqId: rfq.id,
        action: publish ? 'PUBLISHED' : 'CREATED',
        details: `RFQ ${rfq.rfqNumber} ${publish ? 'published' : 'created'}`,
        performedByUserId: session.user.id
      }
    });

    // Notify selected suppliers if published and private
    if (publish && visibility === 'PRIVATE' && selectedSuppliers?.length > 0) {
      for (const supplierId of selectedSuppliers) {
        await prisma.notification.create({
          data: {
            userId: supplierId,
            type: 'REQUIREMENT_CREATED',
            title: 'New RFQ Invitation',
            message: `You have been invited to submit a quote for: ${title}`,
            resourceType: 'rfq',
            resourceId: rfq.id
          }
        });
      }
    }

    return NextResponse.json(rfq, { status: 201 });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const whereClause: any = {
      buyerId: session.user.id
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { rfqNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [rfqs, total] = await Promise.all([
      prisma.requestForQuote.findMany({
        where: whereClause,
        include: {
          _count: { select: { quotes: true } },
          attachments: { select: { id: true, fileName: true, fileType: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.requestForQuote.count({ where: whereClause })
    ]);

    // Get stats
    const stats = await prisma.requestForQuote.groupBy({
      by: ['status'],
      where: { buyerId: session.user.id },
      _count: true
    });

    return NextResponse.json({
      rfqs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: stats.reduce((acc: any, s: any) => ({ ...acc, [s.status]: s._count }), {})
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

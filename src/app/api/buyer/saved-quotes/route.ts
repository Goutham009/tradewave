import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/saved-quotes - List saved quotes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const supplierId = searchParams.get('supplierId');
    const isFavorite = searchParams.get('isFavorite');
    const isTemplate = searchParams.get('isTemplate');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      buyerId: session.user.id
    };

    if (supplierId) where.supplierId = supplierId;
    if (isFavorite !== null) where.isFavorite = isFavorite === 'true';
    if (isTemplate !== null) where.isTemplate = isTemplate === 'true';
    if (search) {
      where.OR = [
        { quoteName: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.savedQuote.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.savedQuote.count({ where })
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching saved quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved quotes' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/saved-quotes - Save a new quote
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      originalQuoteId,
      supplierId,
      supplierName,
      quoteName,
      description,
      productName,
      productCategory,
      specifications,
      quantity,
      quantityUnit,
      unitPrice,
      totalPrice,
      currency,
      paymentTerms,
      deliveryTime,
      incoterms,
      isFavorite,
      isTemplate,
      expiresAt
    } = body;

    // Validate required fields
    if (!supplierId || !quoteName || !productName || !productCategory || !quantity || !unitPrice || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get supplier name if not provided
    let finalSupplierName = supplierName;
    if (!finalSupplierName) {
      const supplier = await prisma.user.findUnique({
        where: { id: supplierId },
        select: { name: true, companyName: true }
      });
      finalSupplierName = supplier?.companyName || supplier?.name || 'Unknown Supplier';
    }

    const savedQuote = await prisma.savedQuote.create({
      data: {
        buyerId: session.user.id,
        originalQuoteId,
        supplierId,
        supplierName: finalSupplierName,
        quoteName,
        description,
        productName,
        productCategory,
        specifications: specifications ? JSON.stringify(specifications) : null,
        quantity,
        quantityUnit: quantityUnit || 'pcs',
        unitPrice,
        totalPrice: totalPrice || quantity * unitPrice,
        currency,
        paymentTerms,
        deliveryTime,
        incoterms,
        isFavorite: isFavorite || false,
        isTemplate: isTemplate || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    });

    return NextResponse.json({ savedQuote }, { status: 201 });
  } catch (error) {
    console.error('Error saving quote:', error);
    return NextResponse.json(
      { error: 'Failed to save quote' },
      { status: 500 }
    );
  }
}

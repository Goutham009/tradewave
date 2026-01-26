import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/favorites - List all favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // SUPPLIER, PRODUCT, QUOTE, CATEGORY
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      buyerId: session.user.id
    };

    if (type) {
      where.favoriteType = type;
    }

    if (search) {
      where.displayName = { contains: search, mode: 'insensitive' };
    }

    const favorites = await prisma.buyerFavorite.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true
          }
        },
        savedQuote: {
          select: {
            id: true,
            quoteName: true,
            productName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by type
    const grouped = {
      suppliers: favorites.filter(f => f.favoriteType === 'SUPPLIER'),
      products: favorites.filter(f => f.favoriteType === 'PRODUCT'),
      quotes: favorites.filter(f => f.favoriteType === 'QUOTE'),
      categories: favorites.filter(f => f.favoriteType === 'CATEGORY')
    };

    return NextResponse.json({ favorites, grouped });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      favoriteType,
      supplierId,
      productSKU,
      productName,
      productCategory,
      supplierProductId,
      savedQuoteId,
      displayName,
      notes
    } = body;

    if (!favoriteType || !displayName) {
      return NextResponse.json(
        { error: 'favoriteType and displayName are required' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.buyerFavorite.findFirst({
      where: {
        buyerId: session.user.id,
        favoriteType,
        ...(supplierId && { supplierId }),
        ...(productSKU && { productSKU }),
        ...(savedQuoteId && { savedQuoteId })
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      );
    }

    const favorite = await prisma.buyerFavorite.create({
      data: {
        buyerId: session.user.id,
        favoriteType,
        supplierId,
        productSKU,
        productName,
        productCategory,
        supplierProductId,
        savedQuoteId,
        displayName,
        notes
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

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

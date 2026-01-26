import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/db';

// GET /api/buyer/saved-quotes/:id - Get saved quote details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const quote = await prisma.savedQuote.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
            avatar: true,
            email: true
          }
        },
        originalQuote: {
          select: {
            id: true,
            quoteNumber: true,
            status: true
          }
        }
      }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error fetching saved quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved quote' },
      { status: 500 }
    );
  }
}

// PATCH /api/buyer/saved-quotes/:id - Update saved quote
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const quote = await prisma.savedQuote.findUnique({
      where: { id }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updatedQuote = await prisma.savedQuote.update({
      where: { id },
      data: {
        quoteName: body.quoteName,
        description: body.description,
        isFavorite: body.isFavorite,
        isTemplate: body.isTemplate,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined
      }
    });

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    console.error('Error updating saved quote:', error);
    return NextResponse.json(
      { error: 'Failed to update saved quote' },
      { status: 500 }
    );
  }
}

// DELETE /api/buyer/saved-quotes/:id - Delete saved quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const quote = await prisma.savedQuote.findUnique({
      where: { id }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.savedQuote.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved quote' },
      { status: 500 }
    );
  }
}

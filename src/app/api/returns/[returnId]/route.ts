import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ returnId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { returnId } = await params;

    const returnRequest = await prisma.return.findUnique({
      where: { id: returnId },
      include: {
        transaction: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            supplier: { select: { id: true, companyName: true } }
          }
        },
        refunds: true,
        reviewedByAdmin: { select: { id: true, name: true } }
      }
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    // Check authorization
    const isBuyer = returnRequest.transaction.buyerId === session.user.id;
    const isSeller = returnRequest.transaction.supplier.id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Get return error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return' },
      { status: 500 }
    );
  }
}

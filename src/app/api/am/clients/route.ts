import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatAccountReference } from '@/lib/flow-references';
import { getDemoAmClientsApiPayload, shouldUseDemoFallback } from '@/lib/demo/fallback';

// GET /api/am/clients - List clients assigned to the logged-in account manager
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['ACCOUNT_MANAGER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (session.user.role === 'ACCOUNT_MANAGER') {
      where.accountManagerId = session.user.id;
    } else if (searchParams.get('accountManagerId')) {
      where.accountManagerId = searchParams.get('accountManagerId');
    }

    if (type && type !== 'all') {
      where.role = type === 'buyer' ? 'BUYER' : 'SUPPLIER';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        companyName: true,
        createdAt: true,
        accountManagerId: true,
        _count: {
          select: {
            requirements: true,
            quotations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      clients: clients.map((client) => ({
        id: client.id,
        accountNumber: formatAccountReference(client.id),
        companyName: client.companyName || 'Unnamed Company',
        contactPerson: client.name,
        email: client.email,
        phone: client.phone,
        type: client.role === 'SUPPLIER' ? 'supplier' : 'buyer',
        status: client.status === 'ACTIVE' ? 'active' : 'inactive',
        totalOrders:
          client.role === 'SUPPLIER'
            ? client._count.quotations
            : client._count.requirements,
        joinedDate: client.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching AM clients:', error);

    if (shouldUseDemoFallback(error)) {
      return NextResponse.json(getDemoAmClientsApiPayload());
    }

    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

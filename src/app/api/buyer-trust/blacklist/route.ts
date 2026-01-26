import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/blacklist - List active blacklist (Admin)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'ACTIVE';
    const reason = searchParams.get('reason');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');

    const whereClause: any = {};
    
    if (status !== 'all') {
      whereClause.status = status;
    }
    if (reason) {
      whereClause.reason = reason;
    }
    if (severity) {
      whereClause.severity = severity;
    }
    if (search) {
      whereClause.buyer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [entries, total] = await Promise.all([
      prisma.buyerBlacklist.findMany({
        where: whereClause,
        include: {
          buyer: { select: { id: true, name: true, email: true, companyName: true } },
          blacklistedByAdmin: { select: { id: true, name: true } },
          appeal: { select: { id: true, status: true } }
        },
        orderBy: { blacklistedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.buyerBlacklist.count({ where: whereClause })
    ]);

    // Get stats
    const stats = await prisma.buyerBlacklist.groupBy({
      by: ['status'],
      _count: true
    });

    return NextResponse.json({
      entries,
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

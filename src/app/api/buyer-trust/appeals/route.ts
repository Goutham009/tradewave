import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/buyer-trust/appeals - List pending appeals (Admin)
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
    const type = searchParams.get('type') || 'all'; // flag, blacklist, all
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const appeals: any[] = [];

    // Flag appeals
    if (type === 'all' || type === 'flag') {
      const flagAppeals = await prisma.flagAppeal.findMany({
        where: { status: status as any },
        include: {
          buyer: { select: { id: true, name: true, email: true, companyName: true } },
          flag: { select: { id: true, flagType: true, severity: true, description: true } },
          attachments: true
        },
        orderBy: { submittedAt: 'asc' },
        take: limit,
        skip: (page - 1) * limit
      });

      appeals.push(...flagAppeals.map(a => ({ ...a, appealType: 'FLAG' })));
    }

    // Blacklist appeals
    if (type === 'all' || type === 'blacklist') {
      const blacklistAppeals = await prisma.blacklistAppeal.findMany({
        where: { status: status as any },
        include: {
          buyer: { select: { id: true, name: true, email: true, companyName: true } },
          blacklist: { select: { id: true, reason: true, severity: true, description: true } },
          attachments: true
        },
        orderBy: { submittedAt: 'asc' },
        take: limit,
        skip: (page - 1) * limit
      });

      appeals.push(...blacklistAppeals.map(a => ({ ...a, appealType: 'BLACKLIST' })));
    }

    // Sort by submission date
    appeals.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    // Get counts
    const [pendingFlags, pendingBlacklist] = await Promise.all([
      prisma.flagAppeal.count({ where: { status: 'PENDING' } }),
      prisma.blacklistAppeal.count({ where: { status: 'PENDING' } })
    ]);

    return NextResponse.json({
      appeals: appeals.slice(0, limit),
      stats: {
        pendingFlags,
        pendingBlacklist,
        totalPending: pendingFlags + pendingBlacklist
      },
      pagination: {
        page,
        limit,
        total: appeals.length
      }
    });
  } catch (error) {
    console.error('Error fetching appeals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

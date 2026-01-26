import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// GET /api/admin/kyb/appeals - Get all KYB appeals (Admin)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [appeals, total] = await Promise.all([
      prisma.kYBAppeal.findMany({
        where,
        include: {
          kyb: {
            include: {
              user: {
                select: { id: true, name: true, email: true, companyName: true }
              }
            }
          },
          documents: true,
          reviewedByAdmin: {
            select: { id: true, name: true }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.kYBAppeal.count({ where })
    ]);

    return NextResponse.json({
      appeals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get KYB Appeals Error:', error);
    return NextResponse.json({ error: 'Failed to fetch appeals' }, { status: 500 });
  }
}

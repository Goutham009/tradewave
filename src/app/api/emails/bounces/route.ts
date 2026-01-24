import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || '';

    const where: Record<string, unknown> = {};
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (type) where.bounceType = type;

    const [bounces, total] = await Promise.all([
      prisma.emailBounce.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailBounce.count({ where }),
    ]);

    return NextResponse.json({
      bounces,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching bounces:', error);
    return NextResponse.json({ error: 'Failed to fetch bounces' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, bounceType, reason } = body;

    if (!email || !bounceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bounce = await prisma.emailBounce.upsert({
      where: { email },
      update: { bounceType, reason, bouncedAt: new Date() },
      create: { email, bounceType, reason, bouncedAt: new Date() },
    });

    return NextResponse.json({ bounce });
  } catch (error) {
    console.error('Error creating bounce:', error);
    return NextResponse.json({ error: 'Failed to create bounce' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ status: 'error', error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = parseInt(searchParams.get('page') || '1');

    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      (prisma as any).notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      (prisma as any).notification.count({ where }),
      (prisma as any).notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    // Only admins can create notifications directly
    if (session.user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const { userId, type, title, message, resourceType, resourceId, metadata } = body;

    if (!userId || !type || !title || !message) {
      return errorResponse('Missing required fields', 400);
    }

    const notification = await (prisma as any).notification.create({
      data: {
        userId,
        type,
        title,
        message,
        resourceType,
        resourceId,
        metadata: metadata || {},
        read: false,
      },
    });

    return successResponse({ notification }, 201);
  } catch (error) {
    console.error('Failed to create notification:', error);
    return errorResponse('Internal server error', 500);
  }
}

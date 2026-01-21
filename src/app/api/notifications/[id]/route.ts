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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const notification = await (prisma as any).notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId !== session.user.id) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const { read } = body;

    const updated = await (prisma as any).notification.update({
      where: { id: params.id },
      data: { read: read ?? true },
    });

    return successResponse({ notification: updated });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const notification = await (prisma as any).notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId !== session.user.id) {
      return errorResponse('Forbidden', 403);
    }

    await (prisma as any).notification.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return errorResponse('Internal server error', 500);
  }
}

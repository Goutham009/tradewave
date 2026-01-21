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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const result = await (prisma as any).notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return successResponse({ 
      message: 'All notifications marked as read',
      count: result.count,
    });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return errorResponse('Internal server error', 500);
  }
}

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        requirements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { verified, kycStatus, role } = body;

    const updateData: any = {};

    if (typeof verified === 'boolean') {
      updateData.verified = verified;
    }

    if (kycStatus) {
      updateData.kycStatus = kycStatus;
    }

    if (role && ['BUYER', 'SUPPLIER', 'ADMIN'].includes(role)) {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse({ user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 401);
    }

    // Soft delete or full delete based on requirements
    await prisma.user.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'User deleted' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return errorResponse('Internal server error', 500);
  }
}

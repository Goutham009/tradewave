import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';

// Standard response helpers
function successResponse(data: any, status = 200) {
  return NextResponse.json({ status: 'success', data }, { status });
}

function errorResponse(message: string, status: number, details?: any) {
  return NextResponse.json({ status: 'error', error: message, details }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const where: any = {};

    // Role-based filtering: Buyers see their own, Suppliers/Admins see all open
    if (session.user.role === 'BUYER') {
      where.buyerId = session.user.id;
    } else if (session.user.role === 'SUPPLIER') {
      where.status = { in: ['SUBMITTED', 'SOURCING', 'QUOTATIONS_READY', 'NEGOTIATING'] };
    }

    // Additional filters
    if (status && status !== 'all') {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          quotations: {
            select: {
              id: true,
              status: true,
              total: true,
              supplierId: true,
              supplier: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                },
              },
            },
          },
          _count: {
            select: {
              quotations: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.requirement.count({ where }),
    ]);

    return successResponse({
      requirements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch requirements:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    // Only buyers can create requirements
    if (session.user.role !== 'BUYER' && session.user.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only buyers can create requirements', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategory,
      specifications,
      quantity,
      unit,
      targetPrice,
      currency,
      deliveryLocation,
      deliveryDeadline,
      priority,
      status: reqStatus,
    } = body;

    // Validation
    const errors: string[] = [];
    if (!title) errors.push('title is required');
    if (!description) errors.push('description is required');
    if (!category) errors.push('category is required');
    if (!quantity || quantity <= 0) errors.push('quantity must be positive');
    if (!deliveryLocation) errors.push('deliveryLocation is required');
    if (!deliveryDeadline) errors.push('deliveryDeadline is required');

    if (errors.length > 0) {
      return errorResponse('Validation failed', 400, { errors });
    }

    // Check deadline is in future
    const deadline = new Date(deliveryDeadline);
    if (deadline <= new Date()) {
      return errorResponse('Delivery deadline must be in the future', 400);
    }

    const requirement = await prisma.requirement.create({
      data: {
        buyerId: session.user.id,
        title,
        description,
        category,
        subcategory,
        specifications: specifications || {},
        quantity,
        unit: unit || 'pcs',
        targetPrice: targetPrice || null,
        currency: currency || 'USD',
        deliveryLocation,
        deliveryDeadline: deadline,
        priority: priority || 'MEDIUM',
        status: reqStatus || 'DRAFT',
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'REQUIREMENT',
        action: 'CREATE',
        description: `Created requirement: ${title}`,
        resourceType: 'requirement',
        resourceId: requirement.id,
      },
    });

    return successResponse({ requirement }, 201);
  } catch (error) {
    console.error('Failed to create requirement:', error);
    return errorResponse('Internal server error', 500);
  }
}

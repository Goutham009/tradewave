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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, companyName: true, email: true },
          },
          requirement: {
            select: { 
              id: true, 
              title: true, 
              category: true,
              buyer: {
                select: { id: true, name: true, companyName: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    // Calculate stats
    const allQuotations = await prisma.quotation.findMany({
      select: { status: true, total: true },
    });

    const stats = {
      total: allQuotations.length,
      pending: allQuotations.filter(q => q.status === 'SUBMITTED').length,
      accepted: allQuotations.filter(q => q.status === 'ACCEPTED').length,
      rejected: allQuotations.filter(q => q.status === 'REJECTED').length,
      totalValue: allQuotations.reduce((sum, q) => sum + Number(q.total || 0), 0),
    };

    // Transform for response
    const transformedQuotations = quotations.map((q: any) => ({
      id: q.id,
      supplierName: q.supplier?.companyName || 'Unknown',
      supplierEmail: q.supplier?.email || '',
      buyerName: q.requirement?.buyer?.name || q.requirement?.buyer?.companyName || 'Unknown',
      buyerEmail: q.requirement?.buyer?.email || '',
      requirementTitle: q.requirement?.title || 'N/A',
      category: q.requirement?.category || 'N/A',
      amount: Number(q.total || 0),
      unitPrice: Number(q.unitPrice || 0),
      quantity: q.quantity || 0,
      currency: q.currency || 'USD',
      status: q.status,
      validUntil: q.validUntil,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));

    return successResponse({
      quotations: transformedQuotations,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch quotations:', error);
    return errorResponse('Internal server error', 500);
  }
}

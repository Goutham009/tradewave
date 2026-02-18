import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/db';
import * as escrowService from '@/lib/services/escrowService';
import * as paymentService from '@/lib/services/paymentService';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const where: any = {};

    // Role-based filtering
    if (session.user.role === 'BUYER') {
      where.buyerId = session.user.id;
    }
    // Admin sees all, Supplier would see their own (if we had supplier users)

    if (status && status !== 'all') {
      // Handle multiple statuses
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          requirement: {
            select: {
              id: true,
              title: true,
              category: true,
              quantity: true,
              unit: true,
              deliveryLocation: true,
              deliveryDeadline: true,
            },
          },
          quotation: {
            select: {
              id: true,
              unitPrice: true,
              quantity: true,
              total: true,
              leadTime: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              companyName: true,
              location: true,
              verified: true,
            },
          },
          escrow: {
            select: {
              id: true,
              status: true,
              amount: true,
              currency: true,
              contractAddress: true,
              deliveryConfirmed: true,
              qualityApproved: true,
              documentsVerified: true,
              autoReleaseDate: true,
            },
          },
          milestones: {
            orderBy: { timestamp: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              documents: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return successResponse({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return errorResponse('Unauthorized', 401);
    }

    // Only buyers can create transactions
    if (session.user.role !== 'BUYER' && session.user.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only buyers can create transactions', 403);
    }

    const body = await request.json();
    const { requirementId, quotationId, supplierId, paymentMethod = 'STRIPE' } = body;

    // Validation
    if (!requirementId || !quotationId || !supplierId) {
      return errorResponse('Missing required fields: requirementId, quotationId, supplierId', 400);
    }

    // Verify requirement exists and belongs to user
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
    });

    if (!requirement) {
      return errorResponse('Requirement not found', 404);
    }

    if (requirement.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
      return errorResponse('Forbidden: Requirement does not belong to you', 403);
    }

    // Verify quotation exists and matches requirement
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { supplier: true },
    });

    if (!quotation) {
      return errorResponse('Quotation not found', 404);
    }

    if (quotation.requirementId !== requirementId) {
      return errorResponse('Quotation does not match requirement', 400);
    }

    if (quotation.status === 'ACCEPTED') {
      return errorResponse('Quotation has already been accepted', 409);
    }

    if (quotation.status === 'EXPIRED') {
      return errorResponse('Quotation has expired', 400);
    }

    // Check for existing active transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        quotationId,
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    });

    if (existingTransaction) {
      return errorResponse('A transaction already exists for this quotation', 409);
    }

    // Create transaction with escrow and payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          requirementId,
          quotationId,
          buyerId: session.user.id,
          supplierId,
          status: 'PAYMENT_PENDING',
          amount: quotation.total,
          currency: quotation.currency,
          paymentMethod,
          destination: requirement.deliveryLocation,
          estimatedDelivery: new Date(Date.now() + quotation.leadTime * 24 * 60 * 60 * 1000),
        },
      });

      // 2. Create escrow record
      const autoReleaseDate = new Date();
      autoReleaseDate.setDate(autoReleaseDate.getDate() + 30); // 30 days auto-release

      const escrow = await tx.escrowTransaction.create({
        data: {
          transactionId: transaction.id,
          totalAmount: quotation.total,
          amount: quotation.total,
          currency: quotation.currency,
          status: 'PENDING',
          autoReleaseDate,
          deliveryConfirmed: false,
          qualityApproved: false,
          documentsVerified: false,
        },
      });

      // 3. Create release conditions
      await tx.releaseCondition.createMany({
        data: [
          {
            escrowId: escrow.id,
            type: 'DELIVERY_CONFIRMED',
            description: 'Delivery must be confirmed by buyer',
          },
          {
            escrowId: escrow.id,
            type: 'QUALITY_APPROVED',
            description: 'Quality must be approved by buyer',
          },
          {
            escrowId: escrow.id,
            type: 'DOCUMENTS_VERIFIED',
            description: 'All documents must be verified',
          },
        ],
      });

      // 4. Create initial milestone
      await tx.transactionMilestone.create({
        data: {
          transactionId: transaction.id,
          status: 'PAYMENT_PENDING',
          description: 'Transaction created, awaiting payment',
          actor: session.user.id,
        },
      });

      // 5. Update quotation status
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'ACCEPTED' },
      });

      // 6. Update requirement status
      await tx.requirement.update({
        where: { id: requirementId },
        data: { status: 'ACCEPTED' },
      });

      return { transaction, escrow };
    });

    // 7. Create payment intent (outside transaction for external API call)
    let paymentIntent = null;
    if (paymentMethod === 'STRIPE') {
      try {
        const paymentResult = await paymentService.createPaymentIntent({
          amount: Number(quotation.total),
          currency: quotation.currency,
          transactionId: result.transaction.id,
          buyerId: session.user.id,
          metadata: {
            requirementId,
            quotationId,
            supplierId,
          },
        });

        if (paymentResult.success) {
          // Create payment record
          await prisma.payment.create({
            data: {
              transactionId: result.transaction.id,
              amount: quotation.total,
              currency: quotation.currency,
              method: 'STRIPE',
              status: 'PENDING',
              providerPaymentId: paymentResult.paymentIntentId,
              clientSecret: paymentResult.clientSecret,
            },
          });

          paymentIntent = {
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntentId,
            method: 'stripe',
          };
        }
      } catch (paymentError) {
        console.error('Payment intent creation failed:', paymentError);
        // Transaction still created, payment can be retried
      }
    }

    // Log activity
    try {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          type: 'TRANSACTION',
          action: 'CREATE',
          description: `Created transaction for ${requirement.title}`,
          resourceType: 'transaction',
          resourceId: result.transaction.id,
        },
      });
    } catch (e) {
      // Activity logging is non-critical
    }

    // Fetch complete transaction with relations
    const fullTransaction = await prisma.transaction.findUnique({
      where: { id: result.transaction.id },
      include: {
        requirement: {
          select: { id: true, title: true, category: true },
        },
        quotation: {
          select: { id: true, total: true, unitPrice: true, quantity: true },
        },
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
        escrow: {
          select: {
            id: true,
            status: true,
            amount: true,
            contractAddress: true,
            deliveryConfirmed: true,
            qualityApproved: true,
            documentsVerified: true,
          },
        },
      },
    });

    return successResponse({
      transaction: fullTransaction,
      paymentIntent,
    }, 201);
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return errorResponse('Internal server error', 500);
  }
}
